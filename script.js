document.addEventListener('DOMContentLoaded', () => {

    // --- GENEL DEĞİŞKENLER VE LOCALSTORAGE İŞLEMLERİ ---
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || []; 
    // Başlangıç bakiyesi 5000₺ olarak ayarlandı
    let userBalance = parseFloat(localStorage.getItem('userBalance')) || 5000; 
    
    const cartCountSpan = document.getElementById('cart-count');
    const totalAmountSpan = document.getElementById('total-amount'); 
    const checkoutButton = document.getElementById('checkout-button'); 
    const cartItemsList = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    
    // Ürün verilerini tanımlama (HTML ve yüklenen görsel isimleri ile senkronize edilmiştir)
    const productData = {
        '1': { name: 'Ayakkabı: Model X', price: 500, image: 'Ayakkabi.jpg', details: 'Yüksek performanslı, şık deri ayakkabı.' },
        '2': { name: 'Çanta: Laptop Pro', price: 850, image: 'Canta.jpg', details: '15.6 inç laptoplar için suya dayanıklı, ergonomik çanta.' },
        '3': { name: 'Akıllı Saat Z', price: 1200, image: 'Saat.jpeg', details: 'Kalp ritmi, uyku takibi ve GPS özellikleri.' },
        '4': { name: 'Şarj Adaptörü', price: 150, image: 'Sarj.jpg', details: 'Hızlı şarj destekli, Alman kalitesinde adaptör.' },
        '5': { name: 'Oyuncak Araba', price: 300, image: 'oyuncaks.jpg', details: 'Uzaktan kumandalı, yüksek hızlı yarış arabası.' },
        '6': { name: 'Ürün F', price: 600, image: 'urun_f.png', details: 'Açıklama F.' },
    };

    // --- BAKIYE GÜNCELLEME VE GÖSTERME İŞLEVİ ---
    function updateBalanceUI() {
        document.querySelectorAll('.balance-info').forEach(el => {
            el.textContent = `${userBalance.toFixed(2)}₺`;
        });
        localStorage.setItem('userBalance', userBalance.toFixed(2));
    }

    // --- SEPET İŞLEVLERİ (Ürünleri listeler ve toplamı hesaplar) ---
    function updateCartUI() {
        if (!cartItemsList) return; 
        
        cartItemsList.innerHTML = ''; 
        let totalCount = 0;
        let totalPrice = 0;

        if (cart.length === 0) {
            if (emptyCartMessage) emptyCartMessage.style.display = 'block';
        } else {
            if (emptyCartMessage) emptyCartMessage.style.display = 'none';
            
            cart.forEach(item => {
                totalCount += item.quantity;
                totalPrice += item.quantity * item.price;
                
                const listItem = document.createElement('li');
                listItem.classList.add('cart-item');
                
                // 💡 Burası ürün adının sepette gözükmesini sağlayan kısımdır.
                listItem.innerHTML = `
                    <span>${item.name} (${item.quantity} x ${item.price.toFixed(2)}₺)</span>
                    <button class="remove-from-cart" data-id="${item.id}">1 Azalt</button>
                `;
                
                cartItemsList.appendChild(listItem);
            });
        }
        
        if (cartCountSpan) cartCountSpan.textContent = totalCount;
        if (totalAmountSpan) totalAmountSpan.textContent = totalPrice.toFixed(2);
        
        // Satın Alma Butonu Kontrolü
        if (checkoutButton) {
            if (totalPrice > userBalance || totalPrice === 0) {
                checkoutButton.disabled = true;
                checkoutButton.textContent = totalPrice === 0 ? 'Sepet Boş' : `Yetersiz Bakiye: ${totalPrice.toFixed(2)}₺`;
            } else {
                checkoutButton.disabled = false;
                checkoutButton.textContent = `SATIN AL (${totalPrice.toFixed(2)}₺)`;
            }
        }
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    }

    function addToCart(productId, quantity = 1) {
        const product = productData[productId];
        if (!product) return;

        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: productId,
                name: product.name,
                price: product.price,
                quantity: quantity
            });
        }
        updateCartUI();
    }

    // --- MENÜ VE SEPET AÇMA/KAPAMA ---
    const gridMenuToggle = document.getElementById('grid-menu-toggle');
    const gridMenu = document.getElementById('grid-menu');
    const cartToggle = document.getElementById('cart-toggle');
    const cartDropdown = document.getElementById('cart-dropdown');
    
    if (gridMenuToggle) {
        gridMenuToggle.addEventListener('click', () => {
            if (cartDropdown && cartDropdown.classList.contains('open')) cartDropdown.classList.remove('open');
            gridMenu.classList.toggle('open');
        });
    }

    if (cartToggle) {
        cartToggle.addEventListener('click', (e) => {
            e.stopPropagation(); 
            if (gridMenu && gridMenu.classList.contains('open')) gridMenu.classList.remove('open');
            cartDropdown.classList.toggle('open');
            updateCartUI();
        });
    }
    
    // Sepet/menü dışına tıklandığında kapatma
    document.addEventListener('click', (e) => {
        if (cartDropdown && cartDropdown.classList.contains('open') && !cartDropdown.contains(e.target) && e.target !== cartToggle) {
            cartDropdown.classList.remove('open');
        }
        if (gridMenu && gridMenu.classList.contains('open') && !gridMenu.contains(e.target) && e.target !== gridMenuToggle) {
            gridMenu.classList.remove('open');
        }
    });

    // --- SEPETİ TAMAMEN TEMİZLE İŞLEVİ ---
    const clearCartButton = document.getElementById('clear-cart-button');
    if (clearCartButton) {
        clearCartButton.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Sepetiniz zaten boş.');
                return;
            }
            if (confirm('Sepetteki tüm ürünleri silmek istediğinize emin misiniz?')) {
                cart = []; 
                updateCartUI(); 
                updateBalanceUI();
                alert('Sepetiniz başarıyla temizlendi.');
            }
        });
    }

    // --- TIKLAMA İŞLEVLERİ (Sepete Ekle, 1 Azalt, Satın Al) ---
    document.addEventListener('click', (e) => {
        // Sepete Ekle
        if (e.target.classList.contains('add-to-cart')) {
            const productElement = e.target.closest('[data-id]');
            if (!productElement) return;
            const productId = productElement.dataset.id;
            let quantity = 1; 
            // Ürün detay sayfasından miktarı alır
            if (document.getElementById('quantity-input')) {
                 quantity = parseInt(document.getElementById('quantity-input').value) || 1;
            }
            addToCart(productId, quantity);
        } 
        
        // Sepetten 1 Adet Azaltma 
        else if (e.target.classList.contains('remove-from-cart')) {
            const productIdToRemove = e.target.dataset.id;
            const itemIndex = cart.findIndex(item => item.id === productIdToRemove);
            
            if (itemIndex > -1) {
                const item = cart[itemIndex];
                // Miktarı 1 azalt
                item.quantity -= 1; 
                
                // Miktar 0'a düşerse ürünü tamamen kaldır
                if (item.quantity <= 0) {
                    cart.splice(itemIndex, 1); 
                }
            }
            updateCartUI();
        } 
        
        // Satın Alma
        else if (e.target.id === 'checkout-button' && !e.target.disabled) {
            const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
            if (totalPrice <= userBalance) {
                userBalance -= totalPrice;
                cart = []; 
                updateCartUI();
                updateBalanceUI();
                alert(`Tebrikler! ${totalPrice.toFixed(2)}₺ tutarındaki alışverişiniz başarıyla tamamlandı. Yeni bakiyeniz: ${userBalance.toFixed(2)}₺`);
            }
        }
    });

    // --- FORM İŞLEVLERİ (Destek ve Para Yatır) ---
    
    // Destek Formu İşlemi
    const supportForm = document.querySelector('.support-form');
    if (supportForm) {
        supportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Talep Başarılı! Destek talebiniz başarıyla gönderildi. En kısa sürede size dönüş yapılacaktır.');
            supportForm.reset();
        });
    }

    // Para Yatırma Sayfası İşlemi
    const depositForm = document.getElementById('deposit-form');
    if (depositForm) {
        depositForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amountInput = document.getElementById('deposit-amount');
            const amount = parseFloat(amountInput.value);

            if (amount > 0) {
                userBalance += amount;
                updateBalanceUI();
                alert(`Başarılı! ${amount.toFixed(2)}₺ sanal bakiye hesabınıza yüklendi. (Gerçek karttan para çekilmemiştir.)`);
                depositForm.reset();
            } else {
                alert('Lütfen geçerli bir miktar giriniz.');
            }
        });
    }
    
    // --- ÜRÜN DETAY SAYFASI VERİ YÜKLEME ---
    // Bu kısım, 'urun-detay.html' sayfasında çalışır ve URL'deki ID'ye göre ürün bilgilerini ekrana basar.
    const productDetailContainer = document.getElementById('product-detail-info');
    if (productDetailContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const product = productData[productId];

        if (product) {
            productDetailContainer.innerHTML = `
                <h2>${product.name}</h2>
                <div class="detail-content">
                    <img src="./images/${product.image}" alt="${product.name}" class="product-image-detail">
                    <div class="product-text">
                        <p class="description">${product.details}</p>
                        <p class="price">Fiyat: <strong>${product.price.toFixed(2)}₺</strong></p>
                        <div class="buy-section" data-id="${productId}" data-name="${product.name}" data-price="${product.price}">
                            <label for="quantity-input">Adet:</label>
                            <input type="number" id="quantity-input" value="1" min="1" max="10">
                            <button class="add-to-cart">Sepete Ekle</button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            productDetailContainer.innerHTML = '<p>Ürün bulunamadı. Lütfen geçerli bir ürün seçiniz.</p>';
        }
    }

    // Sayfa yüklendiğinde UI'yı güncelle
    updateCartUI();
    updateBalanceUI();
});
