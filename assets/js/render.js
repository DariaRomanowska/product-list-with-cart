async function fetchAndRenderProducts() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        const products = await response.json();
        renderProductCards(products);
    } catch (error) {
        console.error(error);
    }
}

let cart = [];

function addToCart(product) {
    const existingProduct = cart.find(item => item.name === product.name);
    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({...product, quantity: 1});
    }
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartList = document.querySelector('.cart-list'),
          cartQuantity = document.getElementById('sum');
    cartList.innerHTML = '';
    const confirmList = document.querySelector('.order__confirmed--products');
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <div class="cart__product order-item-template" id="order-item-template">
                <div class="cart__product--description">
                    <p class="product-name">${item.name}</p>
                    <div class="cost"><span class="quantity">${item.quantity}x</span> <span class="product-price">@${item.price.toFixed(2)}</span> <span
                            class="product-cost">$${(item.price * item.quantity).toFixed(2)}</span></div>
                </div>
                <div class="remove"><img src="assets/images/icon-remove-item.svg" alt="remove product" data-name="${item.name}"></div>
            </div>
        `;
        const orderList = document.createElement('div');
        orderList.classList.add('confirm__product--list');
        orderList.innerHTML = '';
        orderList.innerHTML = `
          <img src="${item.mini}" alt="${item.name}">
            <div class="cart__product--description">
                <p class="product-name">${item.name}</p>
                <div class="cost"><span class="quantity">${item.quantity}x</span> <span class="product-price">@${item.price.toFixed(2)}</span>
                </div>
            </div>
            <span class="product-cost">$${(item.price * item.quantity).toFixed(2)}</span>
        `
        cartList.appendChild(cartItem);
        confirmList.appendChild(orderList)
    });

    const totalCost = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
    cartQuantity.textContent = `${totalQuantity}`
    document.querySelector('.total').textContent = `$${totalCost.toFixed(2)}`;
    document.querySelector('.popup__total').textContent = `$${totalCost.toFixed(2)}`;
    document.querySelectorAll('.remove').forEach(button => {
        button.addEventListener('click', (e) => {
            const productName = e.target.getAttribute('data-name');
            removeFromCart(productName);


            if (cart.length === 0) {
                document.querySelector('.cart__wrap--empty').classList.remove('d-none')
                document.querySelector('.cart__wrap--full').classList.add('d-none')
                removeActiveStatus()
            }
        });
    });
    document.querySelector('.cart__wrap--empty').classList.add('d-none')
    document.querySelector('.cart__wrap--full').classList.remove('d-none')
}


function removeFromCart(name) {
    const productIndex = cart.findIndex(item => item.name === name);
    if (productIndex > -1) {
        cart.splice(productIndex, 1);
    }
    updateCartDisplay();
}

function renderProductCards(products) {
    const productList = document.querySelector('.product-list');
    productList.innerHTML = '';

    productList.innerHTML = products.map(product => {
        console.log(product)
        return `
            <div class="card">
                <picture class="card__img">
                    <source media="(min-width: 740px)" srcset="${product.image.desktop}">
                    <source media="(min-width: 375px)" srcset="${product.image.tablet}">
                    <img src="${product.image.mobile}" alt="${product.name}">
                </picture>
                <button class="card__btn" data-name="${product.name}" data-item="${product.item}" data-mini="${product.mini}" data-price="${product.price.toFixed(2)}">
                    <img src="assets/images/icon-add-to-cart.svg" alt="cart-icon" class="card__btn--img"> 
                    <span class="card__btn--name">Add to cart</span>
                </button>
                <div class="card__description">
                    <p class="card__description--category">${product.category}</p>
                    <p class="card__description--name">${product.name}</p>
                    <p class="card__description--price">$${product.price.toFixed(2)}</p>
                </div>
            </div>
        `;
    }).join('');

    const cardBtns = document.querySelectorAll('.card__btn');

    cardBtns.forEach((btn) => {
        const plus = document.createElement('span'),
            minus = document.createElement('span'),
            cardBtnImg = btn.querySelector('.card__btn--img'),
            cardBtnName = btn.querySelector('.card__btn--name'),
            cardBlock = btn.previousElementSibling;

        let item = 0;

        plus.classList.add('order-btn', 'plus');
        minus.classList.add('order-btn', 'minus');
        plus.style.display = 'none';
        minus.style.display = 'none';

        btn.appendChild(plus);
        btn.appendChild(minus);

        plus.addEventListener('click', (e) => {
            item += 1;
            const productName = btn.getAttribute('data-name');
            const productPrice = parseFloat(btn.getAttribute('data-price'));
            const miniImg = btn.getAttribute('data-mini');
            const productItem = btn.getAttribute('data-item')
            const product = {name: productName, price: productPrice, mini: miniImg, item: productItem};

            addToCart(product);
            updateButtonText();
        });

        minus.addEventListener('click', () => {
            if (item > 0) {
                item--;
                updateButtonText();

                const productName = btn.getAttribute('data-name');

                const existingProduct = cart.find(item => item.name === productName);
                if (existingProduct) {
                    existingProduct.quantity--;
                    if (existingProduct.quantity === 0) {
                        removeFromCart(productName);
                        btn.classList.remove('btn__card--bg');
                        cardBtnImg.style.display = 'flex';
                        plus.style.display = 'none';
                        minus.style.display = 'none';
                        cardBlock.classList.remove('card-active');
                    } else {
                        updateCartDisplay();
                    }
                }
            }
            if (cart.length === 0) {
                document.querySelector('.cart__wrap--empty').classList.remove('d-none')
                document.querySelector('.cart__wrap--full').classList.add('d-none')
            }
        });

        function updateButtonText() {
            cardBtnName.textContent = item > 0 ? `${item}` : 'Add to cart';
        }

        btn.addEventListener("mouseover", (e) => {
            e.preventDefault();
            btn.classList.add('btn__card--bg');
            cardBtnImg.style.display = 'none';
            cardBlock.classList.add('card-active');
            plus.style.display = 'flex';
            minus.style.display = 'flex';
            updateButtonText();
            if (cart.length === 0){
                item = 0
                cart.innerHTML = '';
                e.preventDefault();
                btn.classList.add('btn__card--bg');
                cardBtnImg.style.display = 'none';
                cardBlock.classList.add('card-active');
                plus.style.display = 'flex';
                minus.style.display = 'flex';
                updateButtonText();
            }
        });

        btn.addEventListener("mouseout", () => {
            if (item <= 0) {
                btn.classList.remove('btn__card--bg');
                cardBtnImg.style.display = 'flex';
                plus.style.display = 'none';
                minus.style.display = 'none';
                cardBlock.classList.remove('card-active');
            }
            if (cart.length === 0){
                btn.classList.remove('btn__card--bg');
                cardBtnImg.style.display = 'flex';
                plus.style.display = 'none';
                minus.style.display = 'none';
                cardBlock.classList.remove('card-active');
                item = 0
            }
        });
    });
}

function removeActiveStatus(){
    const activeImg = document.querySelectorAll('.card-active'),
        btnBg = document.querySelectorAll('.btn__card--bg'),
        cardBtnImg = document.querySelectorAll('.card__btn--img'),
        minus = document.querySelectorAll('.minus'),
        plus = document.querySelectorAll('.plus'),
        btnName = document.querySelectorAll('.card__btn--name');
    activeImg.forEach((el) => {
        el.classList.remove('card-active');
    });
    btnBg.forEach((el) => {
        el.classList.remove('btn__card--bg');
    });
    cardBtnImg.forEach((el) => {
        el.style.display = 'flex';
    });
    minus.forEach((el) => {
        el.style.display = 'none';
    });
    plus.forEach((el) => {
        el.style.display = 'none';
    });
    btnName.forEach((el) => {
        el.innerHTML = `Add to cart`
    });
}
document.querySelector('.confirm').addEventListener('click', () => {
    document.querySelector('.popup-bg').classList.remove('d-none');
    document.querySelector('.popup').classList.remove('d-none');
})

document.getElementById('renew').addEventListener('click', () => {
    document.querySelector('.popup-bg').classList.add('d-none');
    document.querySelector('.popup').classList.add('d-none');
    const cartList = document.querySelector('.cart-list'),
        cartQuantity = document.getElementById('sum');
    cartQuantity.innerHTML = `0`;
    cartList.innerHTML = '';
    document.querySelector('.cart__wrap--empty').classList.remove('d-none')
    document.querySelector('.cart__wrap--full').classList.add('d-none');
    removeActiveStatus()
})

fetchAndRenderProducts();

