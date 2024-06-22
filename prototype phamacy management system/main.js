document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;

    if (currentPath.includes('signup.html')) {
        initSignupForm();
    }

    if (currentPath.includes('signin.html')) {
        initSigninForm();
    }

    if (currentPath.includes('doctor.html')) {
        initDoctorScreen();
    }

    if (currentPath.includes('medicine.html')) {
        initMedicineScreen();
    }

    function initSignupForm() {
        document.getElementById('signupForm').addEventListener('submit', async (e) => {
            e.preventDefault();
        
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const passwordhash = document.getElementById('password').value;
            const username = document.getElementById('username').value;
        
            try {
                const response = await fetch('http://localhost:3000/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, passwordhash, username })
                });
        
                const result = await response.json();
        
                if (response.ok) {
                    alert('User signed up successfully!');
                    window.location.href = 'index.html';
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while signing up. Please try again later.');
            }
        });
        
    }

    function initSigninForm() {
        document.getElementById('signinForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const response = await fetch('http://localhost:3000/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert('User signed in successfully!');
                window.location.href = 'index.html';
            } else {
                alert('Error: ' + result.message);
            }
        });
    }

    function initDoctorScreen() {
        const modal = document.getElementById('doctorModal');
        const closeModal = document.querySelector('.close');
        const doctorTableBody = document.querySelector('#doctorTable tbody');

        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                const specialty = this.getAttribute('data-specialty');
                fetchDoctors(specialty);
            });
        });

        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
        });

        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });

        async function fetchDoctors(specialty) {
                try {
                const response = await fetch(`http://localhost:3000/doctors?specialty=${specialty}`);
                const doctors = await response.json();
                populateModal(doctors);
                modal.style.display = 'block';
                } catch (error) {
                console.error('Error fetching doctors:', error);
                }
        }

        function populateModal(doctors) {
            doctorTableBody.innerHTML = '';
            doctors.forEach(doctor => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${doctor.User.name}</td>
                    <td>${doctor.specialty}</td>
                    <td>${doctor.yearsofexperience}</td>
                    <td>${doctor.User.email}</td>
                `;
                doctorTableBody.appendChild(row);
            });
        }
    }

    function initMedicineScreen() {
        const cart = [];
        const cartBtn = document.getElementById('cart-btn');
        const cartModal = document.getElementById('cart-modal');
        const cartClose = cartModal.querySelector('.close');
        const cartContainer = document.getElementById('cart-items');
        const productModal = document.getElementById('product-modal');
        const productClose = productModal.querySelector('.close');
        const modalTitle = document.getElementById('modal-title');
        const modalImage = document.getElementById('modal-image');
        const modalDescription = document.getElementById('modal-description');
        const modalPrice = document.getElementById('modal-price');
        const buyButton = document.getElementById('buy-btn'); // Assume there's a buy button in the cart modal
    
        fetch('http://localhost:3000/drugs')
            .then(response => response.json())
            .then(products => {
                renderProducts(products);
            });
    
        function renderProducts(products) {
            const container = document.getElementById('medicine-products');
            container.innerHTML = '';
            products.forEach(product => {
                const box = document.createElement('div');
                box.classList.add('box');
                box.innerHTML = `
                    <div class="slide-img">
                        <img src="./image-20240611T034251Z-001/image/m9.png" alt="">
                        <div class="overlay">
                            <a href="#" class="learn-btn" data-id="${product.drugid}">Learn more</a>
                        </div>
                    </div>
                    <div class="stars">
                        ${renderStars(product.pharmacy_drug.rating)}
                    </div>
                    <div class="detail-box">
                        <div class="type">
                            <a href="#">${product.tradename}</a>
                            <span>${product.formula}</span>
                        </div>
                        <a href="#" class="price">K${product.pharmacy_drug.price}</a>
                    </div>
                    <a href="#" class="my-button add-to-cart" data-id="${product.drugid}" data-name="${product.tradename}" data-price="${product.pharmacy_drug.price}" data-image="${product.pharmacy_drug.image_url}">Add to cart</a>
                `;
                container.appendChild(box);
            });
    
            container.querySelectorAll('.learn-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    const productId = button.getAttribute('data-id');
                    const product = products.find(p => p.drugid == productId);
                    showProductModal(product);
                });
            });
    
            container.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    const drugid = button.getAttribute('data-id');
                    const name = button.getAttribute('data-name');
                    const price = button.getAttribute('data-price');
                    const image = button.getAttribute('data-image');
                    addToCart(drugid, name, price, image);
                });
            });
        }
    
        function renderStars(rating) {
            let stars = '';
            for (let i = 0; i < 5; i++) {
                stars += `<i class='bx ${i < rating ? 'bxs-star' : 'bxs-star-half'}'></i>`;
            }
            return stars;
        }
    
        function addToCart(drugid, name, price, image) {
            console.log('Adding to cart:', drugid, name, price, image); // Debug statement
            const existingItem = cart.find(item => item.drugid === drugid);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ drugid, name, price, image, quantity: 1 });
            }
            console.log('Cart:', cart); // Debug statement
            renderCart();
        }
    
        function renderCart() {
            cartContainer.innerHTML = '';
            cart.forEach(item => {
                const box = document.createElement('div');
                box.classList.add('box');
                box.style.display = 'flex';
                box.style.alignItems = 'center';
                box.style.backgroundColor = 'white';
                box.style.border = '1px solid #f8a5c2';
                box.style.borderRadius = '5px';
                box.style.padding = '10px';
                box.style.marginBottom = '10px';
        
                box.innerHTML = `
                    <img src="${item.image}" alt="" style="width: 50px; height: 50px; border-radius: 5px; margin-right: 10px;">
                    <div style="flex-grow: 1;">
                        <h1 style="font-size: 16px; margin: 0; color: #333;">${item.name}</h1>
                        <span class="price" style="color: #e84393;">K${item.price}</span>
                    </div>
                    <input type="number" min="1" value="${item.quantity}" data-drugid="${item.drugid}" class="quantity-input" style="width: 60px; margin-right: 10px;">
                    <i class='bx bx-trash remove-btn' data-drugid="${item.drugid}" style="font-size: 30px; color: #e84393; cursor: pointer;"></i>
                `;
        
                cartContainer.appendChild(box);
            });
        
            cartContainer.querySelectorAll('.quantity-input').forEach(input => {
                input.addEventListener('change', (event) => {
                    const drugid = event.target.getAttribute('data-drugid');
                    const quantity = event.target.value;
                    updateQuantity(drugid, quantity);
                });
            });
        
            cartContainer.querySelectorAll('.remove-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const drugid = button.getAttribute('data-drugid');
                    removeFromCart(drugid);
                });
            });
        }
    
        function removeFromCart(drugid) {
            console.log('Removing from cart:', drugid); // Debug statement
            const index = cart.findIndex(item => item.drugid === drugid);
            if (index !== -1) {
                cart.splice(index, 1);
                renderCart();
            }
            console.log('Cart:', cart); // Debug statement
        }
    
        function updateQuantity(drugid, quantity) {
            const item = cart.find(item => item.drugid === drugid);
            if (item) {
                item.quantity = parseInt(quantity, 10);
                renderCart();
            }
        }
    
        function showProductModal(product) {
            modalTitle.textContent = product.tradename;
            modalImage.src = product.pharmacy_drug.image_url;
            modalDescription.textContent = product.formula;
            modalPrice.textContent = `K${product.pharmacy_drug.price}`;
            productModal.style.display = 'block';
        }
    
        productClose.addEventListener('click', () => {
            productModal.style.display = 'none';
        });
    
        cartBtn.addEventListener('click', () => {
            cartModal.style.display = 'block';
        });
    
        cartClose.addEventListener('click', () => {
            cartModal.style.display = 'none';
        })
    
        document.getElementById('search-box').addEventListener('input', (event) => {
            const query = event.target.value.toLowerCase();
            document.querySelectorAll('.box-container .box').forEach(box => {
                const name = box.querySelector('.type a').textContent.toLowerCase();
                box.style.display = name.includes(query) ? '' : 'none';
            });
        });
    
        buyButton.addEventListener('click', () => {
            if (cart.length > 0) {
                cart.forEach(item => {
                    fetch(`http://localhost:3000/drugs/${item.drugid}/buy`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ quantity: item.quantity })
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log(response)
                        console.log(`Updated sales for ${item.name}:`, data);
                    })
                    .catch(error => {
                        console.error(`Error updating sales for ${item.name}:`, error);
                    });
                });
        
                cart.length = 0; // Clear the cart after purchase
                renderCart();
                cartModal.style.display = 'none';
            } else {
                alert('Cart is empty. Please add items to purchase.');
            }
        });
    }
})