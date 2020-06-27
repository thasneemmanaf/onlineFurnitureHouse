const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "d2fyx6w1q75z",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "5vfGLG7DhAZeGnYJEFM7gCzhCBhZ7WrmH6Q-DVZprqw",
});
console.log(client);

// variables
const productsCenter = document.querySelector(".products-center");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const cartOverlay = document.querySelector(".cart-overlay");
const cartDOM = document.querySelector(".cart");
const cartCloseBtn = document.querySelector(".close-cart");
const cartBtn = document.querySelector(".cart-btn");
const clearCartBtn = document.querySelector(".clear-cart");
let buttonsDOM;
//cart
let cart = [];

// to get all the products
class Products {
  async getProductsAPI() {
    try {
      let contentful = await client.getEntries({
        content_type: "comfyHouseProducts",
      });

      // .then((response) => console.log(response.items))
      // .catch(console.error);
      // const productsInfo = await fetch("products.json");
      // const productsData = await productsInfo.json();
      let productsArray = contentful.items;
      productsArray = productsArray.map(function (item) {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return productsArray;
    } catch (error) {}
  }
}

// to dispaly all products
class UI {
  constructor() {}
  // set up application
  setupAPP() {
    cart = localStorage.getItem("cart") ? Storage.getAllCartItems() : [];

    // to dispaly cart total and total number of items
    DisplayCart.getCartValues(cart);

    // to display cart items in the cart
    cart.forEach(function (item) {
      DisplayCart.displayCartItems(item);
    });

    // to open the cart
    cartBtn.addEventListener("click", function () {
      DisplayCart.showCart();
    });

    // to close the cart
    cartCloseBtn.addEventListener("click", function () {
      DisplayCart.hideCart();
    });
  }

  // to clear and update cart
  cartUpdateLogic() {
    // to clear all the items in the cart
    clearCartBtn.addEventListener("click", () => {
      const cartItemIds = cart.map((item) => {
        return item.id;
      });
      cartItemIds.forEach((id) => {
        this.removeCartItem(id);
      });
      while (cartContent.children.length > 0) {
        cartContent.removeChild(cartContent.children[0]);
      }
      DisplayCart.hideCart();
    });

    // to remove a single item using "remove" button &
    // to increase the quantity using "up" arrow button &
    // to decrease the quantity using "down" arrow button
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        const id = event.target.dataset.id;
        this.removeCartItem(id);
        cartContent.removeChild(event.target.parentElement.parentElement);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        const id = event.target.dataset.id;
        const selectedItem = cart.find((cartItem) => {
          return cartItem.id === id;
        });
        selectedItem.quantity += 1;
        DisplayCart.getCartValues(cart);
        Storage.addCartLocal(cart);
        event.target.nextElementSibling.innerText = selectedItem.quantity;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        const id = event.target.dataset.id;
        const selectedItem = cart.find((cartItem) => {
          return cartItem.id === id;
        });
        selectedItem.quantity = selectedItem.quantity - 1;
        if (selectedItem.quantity > 0) {
          Storage.addCartLocal(cart);
          DisplayCart.getCartValues(cart);
          event.target.previousElementSibling.innerText = selectedItem.quantity;
        } else {
          this.removeCartItem(id);
          cartContent.removeChild(event.target.parentElement.parentElement);
          if (cartContent.children.length < 1) {
            DisplayCart.hideCart();
          }
        }
      }
    });
  }

  // to remove a single cart item at a time
  removeCartItem(id) {
    cart = cart.filter((item) => {
      return item.id !== id;
    });
    // add updated cart to the local storage
    Storage.addCartLocal(cart);
    DisplayCart.getCartValues(cart);
    let button = buttonsDOM.find((button) => {
      return button.dataset.id === id;
    });
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }

  displayProducts(productsArray) {
    let results = "";
    productsArray.forEach(function (product) {
      results += `<article class="product">
          <div class="img-container">
            <img
              src="${product.image}"
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id="${product.id}">
              <i class="fas fa-shopping-cart"></i>add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>`;
    });
    productsCenter.innerHTML = results;
  }

  //get all cart buttons
  getCartButtons() {
    const cartButtons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = cartButtons;

    cartButtons.forEach(function (button) {
      let cartId = button.dataset.id;
      let inCart = cart.find(function (item) {
        return item.id === cartId;
      });
      if (inCart) {
        button.innerText = "in cart";
        button.disabled = true;
      }
      button.addEventListener("click", function (event) {
        event.target.innerText = "in cart";
        event.target.disabled = true;

        // get product from local storage
        let cartItem = { ...Storage.getProductsLocal(cartId), quantity: 1 };

        //add cartItem to the cart
        cart = [...cart, cartItem];
        // cart.push(cartItem);

        // add cart to local storage
        Storage.addCartLocal(cart);

        // calculate total num of cart items and cart total
        DisplayCart.getCartValues(cart);

        //to disply cart items
        DisplayCart.displayCartItems(cartItem);

        // to make cart visible
        DisplayCart.showCart();
      });
    });
  }
}

class DisplayCart {
  // get cart total and total number of items
  static getCartValues(cart) {
    let totalSum = 0;
    let totalQuantity = 0;
    cart.forEach(function (item) {
      totalSum += item.price * item.quantity;
      totalQuantity += item.quantity;
    });
    cartItems.innerText = totalQuantity;
    cartTotal.innerText = parseFloat(totalSum.toFixed(2));
  }

  // to display cart items
  static displayCartItems(cartItem) {
    let div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = ` <img src="${cartItem.image}" alt="product" />
            <div>
              <h4>${cartItem.title}</h4>
              <h5>$${cartItem.price}</h5>
              <span class="remove-item" data-id=${cartItem.id}>remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id=${cartItem.id}></i>
              <p class="item-amount">${cartItem.quantity}</p>
              <i class="fas fa-chevron-down" data-id=${cartItem.id}></i>
            </div>`;
    cartContent.appendChild(div);
  }

  // to make cart visible
  static showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  // to close the cart
  static hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
}

// local storage
class Storage {
  // store products to local storage
  static storeProducts(productsArray) {
    localStorage.setItem("products", JSON.stringify(productsArray));
  }

  // get product from local storage
  static getProductsLocal(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(function (product) {
      return product.id === id;
    });
  }

  //get existing cart items during dom load
  static getAllCartItems() {
    return JSON.parse(localStorage.getItem("cart"));
  }

  //   add cart items to storage
  static addCartLocal(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const products = new Products();
  const ui = new UI();

  // set up application during loading and refreshing
  ui.setupAPP();

  products
    .getProductsAPI()
    .then(function (productsArray) {
      ui.displayProducts(productsArray);
      Storage.storeProducts(productsArray);
    })
    .then(function () {
      ui.getCartButtons();
      // logic to clear and update cart
      ui.cartUpdateLogic();
    });
});
