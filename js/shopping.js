// 🧠 Base class
class Product {
  constructor(name, price, category) {
    this.name = name;
    this.price = price;
    this.category = category;
  }
}

// 🛒 CartItem extends Product
class CartItem extends Product {
  constructor(name, price, category, quantity = 1) {
    super(name, price, category);
    this.quantity = quantity;
  }

  get subtotal() {
    return this.price * this.quantity;
  }
}

// 🧾 Cart Class (manages all operations)
class ShoppingCart {
  constructor() {
    this.items = [];
  }

  addItem(product) {
    const existing = this.items.find(item => item.name === product.name);
    if (existing) existing.quantity++;
    else this.items.push(product);
    this.updateDisplay();
  }

  removeItem(index) {
    this.items.splice(index, 1);
    this.updateDisplay();
  }

  updateQuantity(index, qty) {
    this.items[index].quantity = qty;
    this.updateDisplay();
  }

  calculateTotal() {
    return this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  updateDisplay() {
    const tableBody = document.querySelector("#cart-table tbody");
    const totalPriceEl = document.querySelector("#total-price");
    tableBody.innerHTML = "";

    this.items.forEach((item, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.name}</td>
        <td>₱${item.price}</td>
        <td><input type="number" min="1" value="${item.quantity}" class="qty-input" data-index="${index}"></td>
        <td>₱${item.subtotal}</td>
        <td><button class="remove-btn" data-index="${index}">❌</button></td>
      `;
      tableBody.appendChild(row);
    });

    totalPriceEl.textContent = this.calculateTotal().toFixed(2);

    // Add listeners for remove and quantity update
    document.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const index = e.target.dataset.index;
        this.removeItem(index);
      });
    });

    document.querySelectorAll(".qty-input").forEach(input => {
      input.addEventListener("change", e => {
        const index = e.target.dataset.index;
        const newQty = parseInt(e.target.value);
        this.updateQuantity(index, newQty);
      });
    });
  }
}

// 💱 CurrencyConverter class
class CurrencyConverter {
  constructor() {
    this.rates = {
      PHP: 1,
      USD: 0.017,
      EUR: 0.016,
      JPY: 2.65
    };
  }

  convert(amount, toCurrency) {
    return amount * this.rates[toCurrency];
  }
}

// 🧩 Initialize system
document.addEventListener("DOMContentLoaded", () => {
  const cart = new ShoppingCart();
  const converter = new CurrencyConverter();

  document.querySelectorAll(".add-cart").forEach(button => {
    button.addEventListener("click", e => {
      const productElement = e.target.closest(".product");
      const name = productElement.dataset.name;
      const price = parseFloat(productElement.dataset.price);
      const category = productElement.dataset.category;

      const product = new CartItem(name, price, category);
      cart.addItem(product);
    });
  });

  document.querySelector("#convert-btn").addEventListener("click", () => {
    const totalPHP = cart.calculateTotal();
    const currency = document.querySelector("#currency-select").value;
    const converted = converter.convert(totalPHP, currency);

    const symbol = { PHP: "₱", USD: "$", EUR: "€", JPY: "¥" }[currency];
    document.querySelector("#converted-total").textContent =
      `≈ ${symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${currency})`;
  });
});
