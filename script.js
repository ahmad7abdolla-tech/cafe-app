// ============= Database =============
function getData() {
  const data = localStorage.getItem("cafeDB");
  if (data) return JSON.parse(data);
  return {
    menu: [
      {
        id: 1,
        name: "پیتزا مخصوص",
        price: 120000,
        image: null,
        category: "غذا",
      },
      { id: 2, name: "برگر لیر", price: 85000, image: null, category: "غذا" },
      {
        id: 3,
        name: "ساندویچ مرغ",
        price: 65000,
        image: null,
        category: "غذا",
      },
      { id: 4, name: "نوشابه", price: 15000, image: null, category: "نوشیدنی" },
    ],
    orders: [],
    staff: [
      { id: 1, username: "owner", password: "owner123", role: "owner" },
      { id: 2, username: "staff", password: "staff123", role: "staff" },
    ],
    settings: { deliveryFee: 0, deliveryFeeText: "رایگان" },
  };
}

function saveData(data) {
  localStorage.setItem("cafeDB", JSON.stringify(data));
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.style.backgroundColor = type === "success" ? "#27ae60" : "#e74c3c";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function formatPrice(price) {
  if (price === 0) return "رایگان";
  return price.toLocaleString("fa-IR") + " تومان";
}

// ============= Customer Page =============
if (document.getElementById("step1")) {
  let cart = [];
  let menuItems = [];

  const step1 = document.getElementById("step1");
  const step2 = document.getElementById("step2");
  const step3 = document.getElementById("step3");
  const step4 = document.getElementById("step4");

  function loadMenu() {
    const db = getData();
    menuItems = db.menu;
    const menuList = document.getElementById("menuList");

    if (menuItems.length === 0) {
      menuList.innerHTML = '<div class="loading">منو خالی است</div>';
      return;
    }

    menuList.innerHTML = menuItems
      .map(
        (item) => `
      <div class="menu-item">
        ${item.image ? `<img src="${item.image}">` : '<div style="height:90px;width:90px;background:#f0e6d8;border-radius:50%;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:40px">🍔</div>'}
        <h4>${item.name}</h4>
        <div class="price">${formatPrice(item.price)}</div>
        <button class="add-to-cart" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">➕ افزودن به سبد</button>
      </div>
    `,
      )
      .join("");

    document.querySelectorAll(".add-to-cart").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const name = btn.dataset.name;
        const price = parseInt(btn.dataset.price);
        const existing = cart.find((i) => i.id === id);
        if (existing) {
          existing.quantity++;
        } else {
          cart.push({ id, name, price, quantity: 1 });
        }
        updateCartCount();
        showToast(`${name} به سبد اضافه شد`);
      });
    });
  }

  function updateCartCount() {
    const count = cart.reduce((s, i) => s + i.quantity, 0);
    document.getElementById("cartCount").textContent = count;
  }

  function displayCart() {
    const cartItemsDiv = document.getElementById("cartItems");
    if (cart.length === 0) {
      cartItemsDiv.innerHTML = '<div class="loading">سبد خرید خالی است</div>';
      document.getElementById("cartTotal").textContent = "0";
      return;
    }

    cartItemsDiv.innerHTML = cart
      .map(
        (item) => `
      <div class="cart-item">
        <div><strong>${item.name}</strong><br>${formatPrice(item.price)}</div>
        <div class="cart-item-controls">
          <button class="dec-qty" data-id="${item.id}">-</button>
          <span>${item.quantity}</span>
          <button class="inc-qty" data-id="${item.id}">+</button>
          <button class="remove-item" data-id="${item.id}">🗑️</button>
        </div>
      </div>
    `,
      )
      .join("");

    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    document.getElementById("cartTotal").textContent = formatPrice(total);

    document.querySelectorAll(".dec-qty").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        const item = cart.find((i) => i.id === id);
        if (item.quantity > 1) {
          item.quantity--;
        } else {
          cart = cart.filter((i) => i.id !== id);
        }
        displayCart();
        updateCartCount();
      });
    });

    document.querySelectorAll(".inc-qty").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        const item = cart.find((i) => i.id === id);
        item.quantity++;
        displayCart();
        updateCartCount();
      });
    });

    document.querySelectorAll(".remove-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        cart = cart.filter((i) => i.id !== id);
        displayCart();
        updateCartCount();
      });
    });
  }

  document.getElementById("nextToMenu").addEventListener("click", () => {
    const name = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();
    if (!name || !phone) {
      showToast("نام و شماره موبایل را وارد کنید", "error");
      return;
    }
    if (!/^09[0-9]{9}$/.test(phone)) {
      showToast("شماره موبایل معتبر نیست", "error");
      return;
    }
    localStorage.setItem("customerName", name);
    localStorage.setItem("customerPhone", phone);
    step1.classList.remove("active");
    step2.classList.add("active");
    loadMenu();
  });

  document.getElementById("viewCartBtn").addEventListener("click", () => {
    if (cart.length === 0) {
      showToast("سبد خرید خالی است", "error");
      return;
    }
    displayCart();
    step2.classList.remove("active");
    step3.classList.add("active");
  });

  document.getElementById("backToMenu").addEventListener("click", () => {
    step3.classList.remove("active");
    step2.classList.add("active");
  });

  document.getElementById("deliveryType").addEventListener("change", (e) => {
    document.getElementById("addressField").style.display =
      e.target.value === "delivery" ? "block" : "none";
  });

  document.getElementById("submitOrder").addEventListener("click", () => {
    const customerName = localStorage.getItem("customerName");
    const customerPhone = localStorage.getItem("customerPhone");
    const deliveryType = document.getElementById("deliveryType").value;
    const deliveryAddress = document.getElementById("deliveryAddress").value;
    const pickupDate = document.getElementById("pickupDate").value;
    const pickupTime = document.getElementById("pickupTime").value;

    if (!pickupDate || !pickupTime) {
      showToast("تاریخ و ساعت را وارد کنید", "error");
      return;
    }
    if (deliveryType === "delivery" && !deliveryAddress) {
      showToast("آدرس را وارد کنید", "error");
      return;
    }

    const db = getData();
    const deliveryFee =
      deliveryType === "delivery" ? db.settings.deliveryFee : 0;
    const totalPrice =
      cart.reduce((s, i) => s + i.price * i.quantity, 0) + deliveryFee;

    const newOrder = {
      id: Date.now(),
      customer_name: customerName,
      customer_phone: customerPhone,
      items: cart.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      total_price: totalPrice,
      delivery_type: deliveryType,
      delivery_address: deliveryAddress || null,
      delivery_fee: deliveryFee,
      pickup_time: `${pickupDate} ${pickupTime}`,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    db.orders.push(newOrder);
    saveData(db);

    document.getElementById("orderId").textContent = newOrder.id;
    step3.classList.remove("active");
    step4.classList.add("active");
    cart = [];
    updateCartCount();
    showToast("سفارش با موفقیت ثبت شد");
  });

  document.getElementById("newOrderBtn").addEventListener("click", () => {
    step4.classList.remove("active");
    step1.classList.add("active");
    document.getElementById("customerName").value = "";
    document.getElementById("customerPhone").value = "";
    document.getElementById("pickupDate").value = new Date().toLocaleDateString(
      "fa-IR",
    );
    document.getElementById("pickupTime").value = "";
    document.getElementById("deliveryAddress").value = "";
    cart = [];
    updateCartCount();
  });

  document.getElementById("pickupDate").value = new Date().toLocaleDateString(
    "fa-IR",
  );
}

// ============= Staff Login =============
if (document.getElementById("loginBtn")) {
  document.getElementById("loginBtn").addEventListener("click", function () {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const db = getData();
    const user = db.staff.find(
      (s) => s.username === username && s.password === password,
    );

    if (user) {
      localStorage.setItem("loggedStaff", JSON.stringify(user));
      if (user.role === "owner") {
        window.location.href = "owner.html";
      } else {
        window.location.href = "staff-panel.html";
      }
    } else {
      document.getElementById("loginError").style.display = "block";
    }
  });
}

// ============= Staff Panel =============
if (document.getElementById("staffName")) {
  const logged = JSON.parse(localStorage.getItem("loggedStaff"));
  if (!logged) {
    window.location.href = "staff-login.html";
  }
  if (logged.role === "owner") {
    window.location.href = "owner.html";
  }
  document.getElementById("staffName").textContent = logged.username;

  document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("loggedStaff");
    window.location.href = "staff-login.html";
  });

  function loadOrders() {
    const db = getData();
    // مرتب‌سازی بر اساس زمان تحویل (نزدیک‌ترین زمان اول)
    const orders = db.orders
      .filter((o) => o.status === "pending")
      .sort((a, b) => {
        const timeA = new Date(a.pickup_time);
        const timeB = new Date(b.pickup_time);
        return timeA - timeB;
      });
    const container = document.getElementById("ordersList");

    if (orders.length === 0) {
      container.innerHTML =
        '<div class="loading">✨ سفارش جدیدی وجود ندارد</div>';
      return;
    }

    container.innerHTML = orders
      .map(
        (order) => `
      <div class="order-card" data-id="${order.id}">
        <div class="order-header">
          <span class="customer-name">👤 ${order.customer_name}</span>
          <span>📱 ${order.customer_phone}</span>
        </div>
        <div class="order-header">
          <span>${order.delivery_type === "pickup" ? "🏠 حضوری" : "🚚 پیک"}</span>
          <span class="order-time">⏰ ${order.pickup_time}</span>
        </div>
        ${order.delivery_address ? `<div>📍 ${order.delivery_address}</div>` : ""}
        <div class="order-items">
          ${order.items.map((item) => `<div class="order-item"><span>${item.name} x ${item.quantity}</span><span>${formatPrice(item.price * item.quantity)}</span></div>`).join("")}
        </div>
        <div class="order-total">جمع کل: ${formatPrice(order.total_price)}</div>
        <div style="display:flex; gap:10px; margin-top:10px">
          <button class="edit-order-btn btn-secondary" data-id="${order.id}" style="flex:1; background:#f39c12">✏️ ویرایش سفارش</button>
          <button class="complete-btn" data-id="${order.id}" style="flex:1">✅ تایید تحویل</button>
        </div>
      </div>
    `,
      )
      .join("");

    // دکمه تایید تحویل
    document.querySelectorAll(".complete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = parseInt(this.dataset.id);
        const db = getData();
        db.orders = db.orders.filter((o) => o.id !== id);
        saveData(db);
        loadOrders();
        showToast("سفارش تحویل داده شد");
      });
    });

    // دکمه ویرایش سفارش
    document.querySelectorAll(".edit-order-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = parseInt(this.dataset.id);
        const db = getData();
        const order = db.orders.find((o) => o.id === id);
        if (order) {
          openEditOrderModal(order);
        }
      });
    });
  }

  // ویرایش سفارش
  function openEditOrderModal(order) {
    const modal = document.createElement("div");
    modal.className = "modal active";
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close" style="float:left; font-size:28px; cursor:pointer">&times;</span>
        <h3 style="margin-bottom:20px">✏️ ویرایش سفارش</h3>
        <div class="form-group">
          <label>👤 نام مشتری</label>
          <input type="text" id="editCustomerName" class="form-control" value="${order.customer_name}">
        </div>
        <div class="form-group">
          <label>📱 شماره موبایل</label>
          <input type="text" id="editCustomerPhone" class="form-control" value="${order.customer_phone}">
        </div>
        <div class="form-group">
          <label>📅 تاریخ و ساعت تحویل</label>
          <input type="text" id="editPickupTime" class="form-control" value="${order.pickup_time}">
        </div>
        <div class="form-group">
          <label>🚚 نوع تحویل</label>
          <select id="editDeliveryType" class="form-control">
            <option value="pickup" ${order.delivery_type === "pickup" ? "selected" : ""}>حضوری</option>
            <option value="delivery" ${order.delivery_type === "delivery" ? "selected" : ""}>پیک</option>
          </select>
        </div>
        <div class="form-group" id="editAddressField" style="display:${order.delivery_type === "delivery" ? "block" : "none"}">
          <label>📍 آدرس</label>
          <textarea id="editDeliveryAddress" class="form-control" rows="2">${order.delivery_address || ""}</textarea>
        </div>
        <div class="order-items" style="margin:15px 0">
          <h4>آیتم‌های سفارش:</h4>
          <div id="editOrderItems"></div>
        </div>
        <button id="saveOrderEdit" class="btn btn-primary" style="width:100%">💾 ذخیره تغییرات</button>
      </div>
    `;

    document.body.appendChild(modal);

    // نمایش آیتم‌های سفارش
    const itemsContainer = modal.querySelector("#editOrderItems");
    itemsContainer.innerHTML = order.items
      .map(
        (item, idx) => `
      <div class="cart-item" style="margin-bottom:5px">
        <span>${item.name}</span>
        <div class="cart-item-controls">
          <button class="edit-item-dec" data-idx="${idx}">-</button>
          <span>${item.quantity}</span>
          <button class="edit-item-inc" data-idx="${idx}">+</button>
          <button class="edit-item-remove" data-idx="${idx}">🗑️</button>
        </div>
      </div>
    `,
      )
      .join("");

    // تغییر نوع تحویل
    modal.querySelector("#editDeliveryType").addEventListener("change", (e) => {
      const addrField = modal.querySelector("#editAddressField");
      addrField.style.display =
        e.target.value === "delivery" ? "block" : "none";
    });

    // تغییر تعداد آیتم‌ها
    modal.querySelectorAll(".edit-item-dec").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx);
        if (order.items[idx].quantity > 1) {
          order.items[idx].quantity--;
        } else {
          order.items.splice(idx, 1);
        }
        openEditOrderModal(order);
        modal.remove();
      });
    });

    modal.querySelectorAll(".edit-item-inc").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx);
        order.items[idx].quantity++;
        openEditOrderModal(order);
        modal.remove();
      });
    });

    modal.querySelectorAll(".edit-item-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx);
        order.items.splice(idx, 1);
        openEditOrderModal(order);
        modal.remove();
      });
    });

    modal
      .querySelector(".close")
      .addEventListener("click", () => modal.remove());

    modal.querySelector("#saveOrderEdit").addEventListener("click", () => {
      order.customer_name = modal.querySelector("#editCustomerName").value;
      order.customer_phone = modal.querySelector("#editCustomerPhone").value;
      order.pickup_time = modal.querySelector("#editPickupTime").value;
      order.delivery_type = modal.querySelector("#editDeliveryType").value;
      order.delivery_address =
        modal.querySelector("#editDeliveryAddress").value || null;

      const deliveryFee =
        order.delivery_type === "delivery" ? getData().settings.deliveryFee : 0;
      const itemsTotal = order.items.reduce(
        (s, i) => s + i.price * i.quantity,
        0,
      );
      order.total_price = itemsTotal + deliveryFee;
      order.delivery_fee = deliveryFee;

      const db = getData();
      const index = db.orders.findIndex((o) => o.id === order.id);
      db.orders[index] = order;
      saveData(db);
      modal.remove();
      loadOrders();
      showToast("سفارش ویرایش شد");
    });
  }

  function loadMenuManage() {
    const db = getData();
    const container = document.getElementById("menuManageList");

    if (db.menu.length === 0) {
      container.innerHTML = '<div class="loading">منو خالی است</div>';
      return;
    }

    container.innerHTML = db.menu
      .map(
        (item) => `
      <div class="menu-manage-item">
        ${item.image ? `<img src="${item.image}">` : '<div style="height:130px;background:#f0e6d8;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:40px">🍔</div>'}
        <h4>${item.name}</h4>
        <div class="price">${formatPrice(item.price)}</div>
        <button class="edit-btn" data-id="${item.id}">✏️ ویرایش</button>
        <button class="delete-btn" data-id="${item.id}">🗑️ حذف</button>
      </div>
    `,
      )
      .join("");

    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = parseInt(this.dataset.id);
        const item = getData().menu.find((i) => i.id === id);
        openMenuModal(item);
      });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        if (confirm("آیا از حذف این آیتم اطمینان دارید؟")) {
          const id = parseInt(this.dataset.id);
          const db = getData();
          db.menu = db.menu.filter((i) => i.id !== id);
          db.orders.forEach((order) => {
            if (order.status === "pending") {
              order.items = order.items.filter((i) => i.id !== id);
              order.total_price =
                order.items.reduce((s, i) => s + i.price * i.quantity, 0) +
                order.delivery_fee;
            }
          });
          saveData(db);
          loadMenuManage();
          showToast("آیتم حذف شد");
        }
      });
    });
  }

  const menuModal = document.getElementById("menuModal");
  let editingId = null;

  function openMenuModal(item = null) {
    editingId = item ? item.id : null;
    document.getElementById("modalTitle").textContent = item
      ? "✏️ ویرایش آیتم"
      : "➕ آیتم جدید";
    document.getElementById("menuItemId").value = item ? item.id : "";
    document.getElementById("menuName").value = item ? item.name : "";
    document.getElementById("menuPrice").value = item ? item.price : "";
    if (item && item.image) {
      document.getElementById("currentImagePreview").src = item.image;
      document.getElementById("currentImage").style.display = "block";
    } else {
      document.getElementById("currentImage").style.display = "none";
    }
    menuModal.classList.add("active");
  }

  document
    .getElementById("addMenuItemBtn")
    .addEventListener("click", () => openMenuModal(null));

  if (document.querySelector(".close")) {
    document.querySelector(".close").addEventListener("click", () => {
      menuModal.classList.remove("active");
    });
  }

  document.getElementById("menuForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const db = getData();
    const name = document.getElementById("menuName").value;
    const price = parseInt(document.getElementById("menuPrice").value);
    const imageFile = document.getElementById("menuImage").files[0];

    function saveItem(image) {
      if (editingId) {
        const index = db.menu.findIndex((i) => i.id === editingId);
        if (index !== -1) {
          db.menu[index].name = name;
          db.menu[index].price = price;
          if (image) db.menu[index].image = image;
        }
      } else {
        db.menu.push({ id: Date.now(), name, price, image: image || null });
      }
      saveData(db);
      menuModal.classList.remove("active");
      document.getElementById("menuForm").reset();
      document.getElementById("currentImage").style.display = "none";
      loadMenuManage();
      showToast(editingId ? "آیتم ویرایش شد" : "آیتم اضافه شد");
      editingId = null;
    }

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        saveItem(ev.target.result);
      };
      reader.readAsDataURL(imageFile);
    } else {
      saveItem(null);
    }
  });

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const tab = this.dataset.tab;
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      document
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));
      document.getElementById(`${tab}Tab`).classList.add("active");
      if (tab === "orders") {
        loadOrders();
      } else {
        loadMenuManage();
      }
    });
  });

  loadOrders();
  loadMenuManage();
}

// ============= Owner Panel =============
if (document.getElementById("staffList")) {
  const logged = JSON.parse(localStorage.getItem("loggedStaff"));
  if (!logged || logged.role !== "owner") {
    window.location.href = "staff-login.html";
  }

  document
    .getElementById("ownerLogoutBtn")
    .addEventListener("click", function () {
      localStorage.removeItem("loggedStaff");
      window.location.href = "staff-login.html";
    });

  function loadStaffList() {
    const db = getData();
    const container = document.getElementById("staffList");

    container.innerHTML = db.staff
      .map(
        (s) => `
      <div class="staff-item">
        <span>👤 ${s.username} ${s.role === "owner" ? '<span style="color:#e67e22">(مالک)</span>' : ""}</span>
        <div>
          ${s.role !== "owner" ? `<button class="edit-staff-btn" data-id="${s.id}" data-username="${s.username}" data-password="${s.password}" style="background:#f39c12; color:#fff; border:none; padding:6px 12px; border-radius:40px; margin-right:5px; cursor:pointer">✏️</button>` : ""}
          ${s.role !== "owner" ? `<button class="delete-staff-btn" data-id="${s.id}" style="background:#e74c3c; color:#fff; border:none; padding:6px 12px; border-radius:40px; cursor:pointer">🗑️</button>` : ""}
        </div>
      </div>
    `,
      )
      .join("");

    // ویرایش پرسنل
    document.querySelectorAll(".edit-staff-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = parseInt(this.dataset.id);
        const oldUsername = this.dataset.username;
        const oldPassword = this.dataset.password;
        const newUsername = prompt("نام کاربری جدید:", oldUsername);
        if (newUsername && newUsername.trim()) {
          const newPassword = prompt("رمز عبور جدید:", oldPassword);
          if (newPassword) {
            const db = getData();
            const index = db.staff.findIndex((s) => s.id === id);
            if (index !== -1) {
              db.staff[index].username = newUsername.trim();
              db.staff[index].password = newPassword.trim();
              saveData(db);
              loadStaffList();
              showToast("اطلاعات پرسنل ویرایش شد");
            }
          }
        }
      });
    });

    document.querySelectorAll(".delete-staff-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = parseInt(this.dataset.id);
        if (confirm("آیا از حذف این پرسنل اطمینان دارید؟")) {
          const db = getData();
          db.staff = db.staff.filter((s) => s.id !== id);
          saveData(db);
          loadStaffList();
          showToast("پرسنل حذف شد");
        }
      });
    });
  }

  document.getElementById("addStaffBtn").addEventListener("click", function () {
    const username = document.getElementById("newStaffUsername").value.trim();
    const password = document.getElementById("newStaffPassword").value.trim();

    if (!username || !password) {
      showToast("نام کاربری و رمز عبور را وارد کنید", "error");
      return;
    }

    const db = getData();
    if (db.staff.find((s) => s.username === username)) {
      showToast("نام کاربری تکراری است", "error");
      return;
    }

    db.staff.push({ id: Date.now(), username, password, role: "staff" });
    saveData(db);
    document.getElementById("newStaffUsername").value = "";
    document.getElementById("newStaffPassword").value = "";
    loadStaffList();
    showToast("پرسنل اضافه شد");
  });

  function loadDeliveryFee() {
    const db = getData();
    const fee = db.settings.deliveryFee;
    document.getElementById("deliveryFee").value = fee;
    const feeText = fee === 0 ? "رایگان" : formatPrice(fee);
    document.getElementById("deliveryFeeDisplay").innerHTML =
      `هزینه فعلی: <strong style="color:#e67e22">${feeText}</strong>`;
  }

  document
    .getElementById("saveDeliveryFeeBtn")
    .addEventListener("click", function () {
      const fee = parseInt(document.getElementById("deliveryFee").value);
      if (isNaN(fee) || fee < 0) {
        showToast("مبلغ معتبر وارد کنید", "error");
        return;
      }
      const db = getData();
      db.settings.deliveryFee = fee;
      db.settings.deliveryFeeText = fee === 0 ? "رایگان" : formatPrice(fee);
      saveData(db);
      loadDeliveryFee();
      showToast(
        fee === 0
          ? "هزینه پیک: رایگان"
          : `هزینه پیک: ${formatPrice(fee)} تومان`,
      );
    });

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const tab = this.dataset.tab;
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      document
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));
      document.getElementById(`${tab}Tab`).classList.add("active");
      if (tab === "staff") {
        loadStaffList();
      } else {
        loadDeliveryFee();
      }
    });
  });

  loadStaffList();
  loadDeliveryFee();
}
