const express = require('express');
const cors = require('cors');
const { pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = 3000;

app.use(cors());

// Supabase configuration
const supabaseUrl = 'https://rygrueaufdjwnelfkopg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5Z3J1ZWF1ZmRqd25lbGZrb3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgxODEzNTcsImV4cCI6MjAzMzc1NzM1N30.ULSO3frNv8Mx7y8A3_PB-_aJjUVxOLc5IyZnNmohSzk';
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());

// 1. Sign Up
app.post('/signup', async (req, res) => {
    console.log('api hit');
    const { name, email, passwordhash, username } = req.body;

    if (!username || !name || !email || !passwordhash) {
        console.log(req.body);
        console.log(`name: ${name}, email: ${email}, paswordhash: ${passwordhash}, username: ${username}`);
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const { data, error } = await supabase.from('User').insert([{ username, passwordhash, name, email }]);

        if (error) {
            throw error;
        }

        res.status(201).json({ message: 'User signed up successfully', data });
    } catch (error) {
        console.error('Error during signup:', error.message);
        res.status(500).json({ message: 'Failed to sign up user' });
    }
});

// 2. Sign In
app.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    console.log('api hit');
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const { data, error } = await supabase
            .from('User')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            return res.status(400).json({ message: 'Invalid email' });
        }

        const user = data;

        if (user.passwordhash === password) { // Compare hashed password in a real application
            return res.status(200).json({ message: 'User signed in successfully!', user });
        } else {
            return res.status(400).json({ message: 'Invalid password' });
        }
    } catch (error) {
        console.error('Error during sign in:', error.message);
        res.status(500).json({ message: 'Failed to sign in user' });
    }
});

// 3. Get doctors info
app.get('/all-doctors', async (req, res) => {
  try {
      const { data, error } = await supabase
          .from('doctor')
          .select(`
              User (
                  name,
                  email
              ),
              specialty,
              yearsofexperience
          `);

      if (error) throw error;
      console.log(data);
      res.status(200).send(data);
  } catch (error) {
      console.error('Error fetching doctors:', error);
      res.status(500).send({ error: 'An error occurred while fetching doctors' });
  }
});

// 4. Get specialist doctors info
app.get('/doctors', async (req, res) => {
  const specialty = req.query.specialty;

  if (!specialty) {
      return res.status(400).send({ error: 'Specialty is required' });
  }

  try {
      const { data, error } = await supabase
          .from('doctor')
          .select(`
              User (
                  name,
                  email
              ),
              specialty,
              yearsofexperience
          `)
          .eq('specialty', specialty);

      if (error) throw error;
      console.log(data);
      const orderedList = data.sort((a, b) => b.yearsofexperience- a.yearsofexperience);
      res.status(200).send(orderedList);
  } catch (error) {
      console.error('Error fetching doctors:', error);
      res.status(500).send({ error: 'An error occurred while fetching doctors' });
  }
});

// 5. Get medicine
app.get('/drugs', async (req, res) => {
  try {
    const { data: drugs, error: drugError } = await supabase
      .from('drug')
      .select('drugid, tradename, formula, pharmaceuticalcompany (name)');

    if (drugError) {
      throw drugError;
    }
    
    const drugIds = drugs.map(drug => drug.drugid);
    const { data: pharmacyDrugs, error: pharmacyDrugError } = await supabase
      .from('pharmacy_drug')
      .select('drugid, price, image_url, rating')
      .in('drugid', drugIds);

    if (pharmacyDrugError) {
      throw pharmacyDrugError;
    }
    
    const formattedData = drugs.map(drug => {
      const pharmacyDrug = pharmacyDrugs.find(pd => pd.drugid === drug.drugid) || {};
      return {
        ...drug,
        pharmacy_drug: pharmacyDrug
      };
    });

    console.log(formattedData);
    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching drugs:', error.message);
    res.status(500).json({ error: 'Failed to fetch drugs' });
  }
});

app.post('/drugs/:drugid/buy', async (req, res) => {
  const { drugid } = req.params;
  const { quantity } = req.body;

  try {
    const { data: currentData, error: fetchError } = await supabase
      .from('pharmacy_drug')
      .select('number_of_sales')
      .eq('drugid', drugid)
      .single();

    if (fetchError) {
      throw fetchError;
    }
    
    const currentNumber_of_sales = currentData.number_of_sales || 0; // Default to 0 if currentData.number_of_sales is undefined
    const newNumber_of_sales = currentNumber_of_sales + quantity;

    const { data: updateData, error: updateError } = await supabase
      .from('pharmacy_drug')
      .update({ number_of_sales: newNumber_of_sales })
      .eq('drugid', drugid);

    if (updateError) {
      throw updateError;
    }

    res.status(200).json(updateData);
  } catch (error) {
    console.error('Error updating sales:', error.message);
    res.status(500).json({ error: 'Failed to update sales' });
  }
});

app.get('/best-selling-drugs', async (req, res) => {
  const { data, error } = await supabase
      .from('pharmacy_drug')
      .select('drugid, number_of_sales, price, drug(tradename)')
      .order('number_of_sales', { ascending: false });

  if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
  }

  const bestSellingDrugs = data.map(item => ({
      tradename: item.drug.tradename,
      sales: item.number_of_sales,
      income: item.price * item.number_of_sales,
      price: item.price
  }));

  res.status(200).json(bestSellingDrugs);
});

app.get('/best-pharmacies', async (req, res) => {
  const { data, error } = await supabase
      .from('pharmacy_drug')
      .select('pharmacyname, number_of_sales, price')

  if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
  }

  const bestPharmacies = data.map(item => ({
      name: item.pharmacyname,
      ordercount: item.number_of_sales,
      income: item.number_of_sales * item.price
  }));

  bestPharmacies.sort((a, b) => b.income - a.income);

  res.status(200).json(bestPharmacies);
});

app.get('/best-doctors', async (req, res) => {
  const { data, error } = await supabase
      .from('doctor')
      .select('*')
      .order('yearsofexperience', { ascending: false });

  if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
});

app.get('/patients', async (req, res) => {
  const { data, error } = await supabase
      .from('patient')
      .select('*');

  if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
});

app.get('/pharmacies', async (req, res) => {
  const { data, error } = await supabase
      .from('pharmacy')
      .select('*');

  if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
});

app.get('/pharmaceutical-companies', async (req, res) => {
  const { data, error } = await supabase
      .from('pharmaceuticalcompany')
      .select('*');

  if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
});

app.post('/add-doctor', async (req, res) => {
  try {
    const { name, email, specialty, yearsofexperience } = req.body;
    const { data, error } = await supabase
      .from('doctor')
      .insert({ name, email, specialty, yearsofexperience });
    if (error) throw error;
    console.log(data);
    res.status(201).send(data);
  } catch (error) {
    console.error('Error adding doctor:', error);
    res.status(500).send({ error: 'An error occurred while adding doctor' });
  }
});

app.post('/add-pharmacy', async (req, res) => {
  try {
    const { name, address, phonenumber } = req.body;
    const { data, error } = await supabase
      .from('pharmacy')
      .insert({ name, address, phonenumber });
    if (error) throw error;
    console.log(data);
    res.status(201).send(data);
  } catch (error) {
      console.error('Error adding pharmacy:', error);
      res.status(500).send({ error: 'An error occurred while adding pharmacy' });
    }
});

//add pharmaceutical company
app.post('/add-pharmaceutical-company', async (req, res) => {
  try {
    const { name, phonenumber, registered_on } = req.body;
    const { data, error } = await supabase
      .from('pharmaceutical_company')
      .insert({ name, phonenumber, registered_on });
    if (error) throw error;
    console.log(data);
    res.status(201).send(data);
  } catch (error) {
    console.error('Error adding pharmaceutical company:', error);
    res.status(500).send({ error: 'An error occurred while adding pharmaceutical company' });
  }
});

//Add new drug
app.post('/add-drug', async (req, res) => {
  try {
    const { tradename, price, sales } = req.body;
    const { data, error } = await supabase
      .from('drug')
      .insert({ tradename, price, sales });
    if (error) throw error;
    console.log(data);
    res.status(201).send(data);
  } catch (error) {
    console.error('Error adding drug:', error);
    res.status(500).send({ error: 'An error occurred while adding drug' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
