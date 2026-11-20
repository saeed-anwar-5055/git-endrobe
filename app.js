const $ = (s) => document.querySelector(s);
const WHATSAPP_NUMBER = "923168920170"; // Pakistan country code + number, without leading zero
const money = (n) => new Intl.NumberFormat("en-PK", {
  style: "currency", currency: "PKR", maximumFractionDigits: 0
}).format(Number(n || 0));

const demoProducts = [
  {id:1,name:"Noir Tailored Blazer",category:"Men",price_pkr:28500,description:"A sharp modern silhouette in a premium textured finish.",image_url:"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900",sizes:["S","M","L","XL"],featured:true},
  {id:2,name:"Burgundy Evening Dress",category:"Women",price_pkr:32000,description:"An elegant evening statement with a fluid silhouette.",image_url:"https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=900",sizes:["XS","S","M","L"],featured:true},
  {id:3,name:"Sculpted Leather Sneakers",category:"Shoes",price_pkr:18500,description:"Minimal leather sneakers with a sculpted profile.",image_url:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900",sizes:["40","41","42","43","44"]},
  {id:4,name:"Monogram Shoulder Bag",category:"Bags",price_pkr:24500,description:"A refined everyday bag with considered details.",image_url:"https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900"},
  {id:5,name:"Atelier Oversized Hoodie",category:"Streetwear",price_pkr:12500,description:"Heavyweight comfort with a premium streetwear attitude.",image_url:"https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900",sizes:["S","M","L","XL"]},
  {id:6,name:"Heritage Gold Watch",category:"Watches",price_pkr:45000,description:"A timeless accessory inspired by classic proportions.",image_url:"https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=900"},
  {id:7,name:"Velvet Oud Parfum",category:"Perfumes",price_pkr:9800,description:"A deep, warm fragrance for evenings and special moments.",image_url:"https://images.unsplash.com/photo-1594035910387-fea47794261f?w=900"},
  {id:8,name:"Gold Signet Ring",category:"Accessories",price_pkr:7500,description:"A subtle finishing touch in a timeless form.",image_url:"https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900"},
  {id:9,name:"Ivory Relaxed Shirt",category:"Men",price_pkr:8900,description:"An easy, elevated essential for a modern wardrobe.",image_url:"https://images.unsplash.com/photo-1603252109303-2751441dd157?w=900",sizes:["S","M","L","XL"]},
  {id:10,name:"Satin Draped Top",category:"Women",price_pkr:11500,description:"Soft draping and a confident, understated finish.",image_url:"https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=900",sizes:["XS","S","M","L"]}
];

let products = [];
let cart = JSON.parse(localStorage.getItem("endrobe-cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("endrobe-wishlist") || "[]");
const save = () => {
  localStorage.setItem("endrobe-cart", JSON.stringify(cart));
  localStorage.setItem("endrobe-wishlist", JSON.stringify(wishlist));
  $("#cart-count").textContent = cart.reduce((n, x) => n + x.quantity, 0);
  $("#wish-count").textContent = wishlist.length;
};

function toast(message) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("active");
  setTimeout(() => el.classList.remove("active"), 2300);
}

function loadProducts() {
  // Standalone catalogue: no API, server, or database required.
  products = demoProducts;
  renderProducts();
}

function renderProducts() {
  const query = ($("#search")?.value || "").toLowerCase();
  const category = $("#category")?.value || "";
  const sort = $("#sort")?.value || "featured";
  let list = products.filter(p =>
    (!category || p.category === category) &&
    (`${p.name} ${p.category} ${p.description || ""}`).toLowerCase().includes(query)
  );
  if (sort === "price_asc") list.sort((a,b) => a.price_pkr-b.price_pkr);
  if (sort === "price_desc") list.sort((a,b) => b.price_pkr-a.price_pkr);
  $("#product-count").textContent = `${list.length} PIECES`;
  $("#products").innerHTML = list.length ? list.map(p => `
    <article class="product-card">
      <div class="product-image" data-view="${p.id}">
        <img loading="lazy" src="${p.image_url || ""}" alt="${p.name}">
        ${p.featured ? '<span class="product-tag">SIGNATURE</span>' : ""}
        <button class="wishlist-btn" data-wish="${p.id}" aria-label="Add to wishlist">${wishlist.includes(p.id) ? "♥" : "♡"}</button>
      </div>
      <div class="product-info">
        <p>${p.category}</p><h3>${p.name}</h3>
        <strong>${money(p.price_pkr)}</strong>
        <button class="quick-view" data-view="${p.id}">QUICK VIEW ↗</button>
      </div>
    </article>`).join("") : "<p>No pieces found. Try another search.</p>";
}

function openDrawer(title, html) {
  $("#drawer-title").textContent = title;
  $("#drawer-content").innerHTML = html;
  $("#overlay").classList.add("active");
}
function closeDrawer() { $("#overlay").classList.remove("active"); }
function openModal(html) {
  $("#modal-content").innerHTML = html;
  $("#modal").classList.add("active");
}
function closeModal() { $("#modal").classList.remove("active"); }

function addToCart(id, size = "One Size") {
  const p = products.find(x => Number(x.id) === Number(id));
  if (!p) return;
  const item = cart.find(x => Number(x.id) === Number(id) && x.size === size);
  if (item) item.quantity++;
  else cart.push({id:p.id,name:p.name,price:Number(p.price_pkr),image:p.image_url,size,quantity:1});
  save(); toast("Added to your bag");
}
function showCart() {
  const total = cart.reduce((n,x) => n + x.price*x.quantity, 0);
  openDrawer("YOUR BAG", cart.length ? cart.map((x,i) => `
    <div class="cart-row"><img src="${x.image}" alt="">
      <div><h3>${x.name}</h3><p>${x.size} · ${money(x.price)}</p>
      <p>Quantity: ${x.quantity}</p><button data-remove="${i}">REMOVE</button></div>
    </div>`).join("") + `<div class="drawer-total">Subtotal<br><strong>${money(total)}</strong></div>
    <button class="action-button" id="checkout">PROCEED TO CHECKOUT</button>` : "<p>Your bag is waiting for something exceptional.</p>");
}
function showWishlist() {
  const items = products.filter(p => wishlist.includes(p.id));
  openDrawer("WISHLIST", items.length ? items.map(p => `
    <div class="cart-row"><img src="${p.image_url}" alt=""><div><h3>${p.name}</h3>
    <p>${money(p.price_pkr)}</p><button data-add="${p.id}">ADD TO BAG</button>
    <button data-unwish="${p.id}">REMOVE</button></div></div>`).join("") : "<p>Your wishlist is empty.</p>");
}
function showProduct(id) {
  const p = products.find(x => Number(x.id) === Number(id));
  if (!p) return;
  const sizes = p.sizes?.length ? p.sizes : ["One Size"];
  openModal(`<div class="modal-product"><img src="${p.image_url}" alt="${p.name}">
    <div><p class="eyebrow">${p.category} / ENDROBE</p><h2>${p.name}</h2>
    <strong>${money(p.price_pkr)}</strong><p>${p.description || "A considered piece from the ENDROBE collection."}</p>
    <label for="product-size">SELECT SIZE</label>
    <select id="product-size">${sizes.map(s => `<option>${s}</option>`).join("")}</select>
    <button class="action-button" id="modal-add" data-id="${p.id}">ADD TO BAG</button></div></div>`);
}

function checkoutForm() {
  const total = cart.reduce((n,x) => n + x.price*x.quantity, 0);
  if (!cart.length) { toast("Your bag is empty"); return; }
  openModal(`<h2>Complete your order</h2><p class="eyebrow">WHATSAPP ORDER · PKR</p>
    <form id="checkout-form">
      <input class="form-field" name="customer_name" placeholder="Full name" required>
      <input class="form-field" name="email" type="email" placeholder="Email address (optional)">
      <input class="form-field" name="phone" type="tel" placeholder="Customer WhatsApp / phone number" required>
      <input class="form-field" name="address" placeholder="Complete delivery address" required>
      <input class="form-field" name="city" placeholder="City" required>
      <select class="form-field" name="payment_method">
        <option value="Cash on Delivery">Cash on Delivery</option>
        <option value="JazzCash">JazzCash</option>
        <option value="Easypaisa">Easypaisa</option>
        <option value="Bank Transfer">Bank Transfer</option>
      </select>
      <textarea class="form-field" name="notes" placeholder="Order notes (optional)" rows="3"></textarea>
      <p>Order total: <strong>${money(total)}</strong></p>
      <button class="action-button" type="submit">SEND ORDER TO WHATSAPP</button>
      <small>Your order details will open in WhatsApp. Please press Send to confirm.</small>
    </form>`);
}

document.addEventListener("click", async e => {
  const t = e.target;
  if (t.closest("[data-view]")) showProduct(t.closest("[data-view]").dataset.view);
  if (t.matches("[data-wish]")) {
    e.stopPropagation();
    const id = Number(t.dataset.wish);
    wishlist = wishlist.includes(id) ? wishlist.filter(x => x !== id) : [...wishlist,id];
    save(); renderProducts(); toast("Wishlist updated");
  }
  if (t.matches("[data-remove]")) { cart.splice(Number(t.dataset.remove),1); save(); showCart(); }
  if (t.matches("[data-add]")) { addToCart(t.dataset.add); showCart(); }
  if (t.matches("[data-unwish]")) { wishlist = wishlist.filter(x => x !== Number(t.dataset.unwish)); save(); showWishlist(); renderProducts(); }
  if (t.id === "modal-add") { addToCart(t.dataset.id, $("#product-size").value); closeModal(); }
  if (t.id === "cart-open") showCart();
  if (t.id === "wishlist-open") showWishlist();
  if (t.id === "drawer-close" || t.id === "overlay") closeDrawer();
  if (t.id === "modal-close" || t.id === "modal") closeModal();
  if (t.id === "checkout") checkoutForm();
  if (t.id === "checkout-form" || t.closest("#checkout-form")) {
    if (t.tagName === "BUTTON") return;
  }
});
document.addEventListener("submit", e => {
  if (e.target.id === "checkout-form") {
    e.preventDefault();
    if (!cart.length) { toast("Your bag is empty"); return; }
    const customer = Object.fromEntries(new FormData(e.target));
    const orderId = "END-" + Date.now().toString().slice(-8);
    const total = cart.reduce((n,x) => n + x.price*x.quantity, 0);
    const itemLines = cart.map((item, index) =>
      `${index + 1}. ${item.name}\n   Size: ${item.size} | Qty: ${item.quantity} | Unit: ${money(item.price)} | Line total: ${money(item.price * item.quantity)}`
    ).join("\n\n");
    const message = [
      "*NEW ENDROBE ORDER*",
      `Order ID: ${orderId}`,
      "",
      "*CUSTOMER DETAILS*",
      `Name: ${customer.customer_name}`,
      `Phone: ${customer.phone}`,
      `Email: ${customer.email || "Not provided"}`,
      `Address: ${customer.address}`,
      `City: ${customer.city}`,
      `Payment preference: ${customer.payment_method}`,
      `Notes: ${customer.notes || "None"}`,
      "",
      "*ORDER ITEMS*",
      itemLines,
      "",
      `*TOTAL: ${money(total)}*`,
      "",
      "Please confirm availability and delivery details."
    ].join("\n");
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    toast("WhatsApp opened — press Send to confirm your order");
  }
  if (e.target.id === "newsletter") {
    e.preventDefault(); e.target.reset(); toast("Thank you for joining ENDROBE.");
  }
});

["search","category","sort"].forEach(id => $("#"+id)?.addEventListener("input",renderProducts));
$("#menu-toggle")?.addEventListener("click", () => $("#navigation").classList.toggle("open"));
$("#drawer-close")?.addEventListener("click", closeDrawer);
$("#modal-close")?.addEventListener("click", closeModal);
$("#style-button")?.addEventListener("click", () => {
  const occasion = $("#occasion").value;
  const picks = products.filter(p => occasion === "formal" ? ["Men","Women","Watches"].includes(p.category) : occasion === "evening" ? ["Women","Bags","Perfumes"].includes(p.category) : ["Men","Streetwear","Shoes"].includes(p.category)).slice(0,3);
  $("#style-result").innerHTML = `<p>Your ${occasion} edit:</p><strong>${picks.map(p=>p.name).join(" · ")}</strong>`;
});
$("#vip-button")?.addEventListener("click", () => openModal("<h2>The Inner Circle</h2><p>VIP membership is coming soon. Join our newsletter for private collection updates.</p>"));
// Order placement is handled directly through WhatsApp; no tracking/admin server is used.

window.addEventListener("load", () => {
  document.body.classList.remove("loading");
  const preloader = $("#preloader");
  if (window.gsap) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to(preloader,{autoAlpha:0,duration:.8,delay:.7,onComplete:()=>preloader.remove()});
    gsap.utils.toArray(".reveal, .section-head").forEach(el => gsap.from(el,{y:35,opacity:0,duration:1,scrollTrigger:{trigger:el,start:"top 88%"}}));
  } else setTimeout(()=>preloader?.remove(),1200);

  if (matchMedia("(pointer:fine)").matches) {
    const dot=$("#cursor"), ring=$("#cursor-outline");
    window.addEventListener("mousemove",e=>{
      dot.style.left=ring.style.left=e.clientX+"px";
      dot.style.top=ring.style.top=e.clientY+"px";
    });
    document.querySelectorAll("a,button,input,select,textarea,[role='button']").forEach(el=>{
      el.addEventListener("mouseenter",()=>{
        ring.classList.add("hover");
        dot.classList.add("hover-dot");
      });
      el.addEventListener("mouseleave",()=>{
        ring.classList.remove("hover");
        dot.classList.remove("hover-dot");
      });
    });
  }
  save(); loadProducts();
});
