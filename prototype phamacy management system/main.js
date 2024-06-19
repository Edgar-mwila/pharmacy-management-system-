let searchform = document.querySelector('.search-form')

document.querySelector('#search-btn').onclick = () =>
    {
        searchform.classList.toggle('active');
        shoppingCart.classList.remove('active');
        uploadForm.classList.remove('active');
    }

let shoppingCart = document.querySelector('.shopping-cart')

    document.querySelector('#cart-btn').onclick = () =>
        {
            shoppingCart.classList.toggle('active');
            searchform.classList.remove('active');
            uploadForm.classList.remove('active');
        }

let uploadForm = document.querySelector('upload-form');
const defaultBtn = document.querySelector('.default-btn');
const custonBtn = document.querySelector('.custom-btn');
const fileName = document.querySelector('.file-name');

let regexp = /[0-9a-zA-Z\^\&\'\@\(\)\[\]\.\$\=\!\-\#\(\)\.\%\+\~\_]+$/;

function active(){
    defaultBtn.click();
}
defaultBtn.addEventListener("change",function(){
    if (this.value){
        let nameValue = this.value.match(regExp);
        fileName.textContent = nameValue;
    }
});
document.querySelector('#up-btn').onclick = () =>
    {
        uploadForm.classList.toggle('active');
        searchform.classList.remove('active');
        shoppingCart.classList.remove('active');

    }

    window.onscroll = () =>
        {
            searchform.classList.remove('active');
            shoppingCart.classList.remove('active');
            uploadForm.classList.remove('active');
        }