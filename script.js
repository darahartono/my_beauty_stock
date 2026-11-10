
const API_URL = "api.php";
const LOW_STOCK_LIMIT = 3;
const EXPIRY_WARNING_DAYS = 30;

const homePage = document.getElementById("home-page");
const formPage = document.getElementById("form-page");
const pageTitle = document.getElementById("page-title");
const productForm = document.getElementById("product-form");
const formError = document.getElementById("form-error");
const saveButton = document.getElementById("save-button");
const productTable = document.getElementById("product-table");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");

let products = [];
let toastTimeout;

// FORMAT TANGGAL
function localDateString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
}

function parseLocalDate(value) {
    if (!value) return null;

    const parts = String(value).split("-").map(Number);

    return new Date(parts[0], parts[1] - 1, parts[2]);
}

function formatDate(value) {
    const date = parseLocalDate(value);

    return date
        ? date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        })
        : "-";
}

function daysUntilExpiry(value) {
    const expiry = parseLocalDate(value);

    if (!expiry) return null;

    const today = parseLocalDate(localDateString(new Date()));

    return Math.round((expiry - today) / 86400000);
}

// MENGAMANKAN TEKS HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

// KONEKSI KE API PHP
async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    const text = await response.text();

    let payload;

    try {
        payload = JSON.parse(text);
    } catch (error) {
        console.error("Respons API bukan JSON:", text);

        throw new Error(
            "Respons server tidak valid. Periksa api.php dan database.php."
        );
    }

    if (!response.ok || payload.success === false) {
        throw new Error(
            payload.message || "Terjadi kesalahan pada server."
        );
    }

    return payload;
}

// MENGAMBIL DATA PRODUK DARI DATABASE
async function loadProducts() {
    productTable.innerHTML = `
        <tr>
            <td colspan="6" class="empty-cell">
                Memuat data produk...
            </td>
        </tr>
    `;

    try {
        const result = await apiRequest(API_URL);

        if (!Array.isArray(result.data)) {
            throw new Error("Format data produk dari server tidak valid.");
        }

        products = result.data;

        renderDashboard();
        renderTable();

    } catch (error) {
        console.error("Gagal mengambil produk:", error);

        productTable.innerHTML = `
            <tr>
                <td colspan="6" class="empty-cell">
                    ${escapeHTML(error.message)}
                </td>
            </tr>
        `;

        showToast(error.message);
    }
}

// STATISTIK DASHBOARD
function renderDashboard() {
    document.getElementById("total-products").textContent =
        products.length;

    document.getElementById("total-stock").textContent =
        products.reduce(
            (sum, product) => sum + Number(product.quantity || 0),
            0
        );

    document.getElementById("low-stock").textContent =
        products.filter(
            product => Number(product.quantity) <= LOW_STOCK_LIMIT
        ).length;

    document.getElementById("expiry-count").textContent =
        products.filter(product => {
            const days = daysUntilExpiry(product.expiry_date);
            return days !== null && days <= EXPIRY_WARNING_DAYS;
        }).length;
}

// STATUS PRODUK
function productStatus(product) {
    const days = daysUntilExpiry(product.expiry_date);

    if (days !== null && days < 0) {
        return {
            label: "Kedaluwarsa",
            className: "expired"
        };
    }

    if (Number(product.quantity) <= LOW_STOCK_LIMIT) {
        return {
            label: "Stok Menipis",
            className: "low"
        };
    }

    if (days !== null && days <= EXPIRY_WARNING_DAYS) {
        return {
            label: "Segera Exp.",
            className: "expiry"
        };
    }

    return {
        label: "Tersedia",
        className: "ok"
    };
}

// MENAMPILKAN TABEL PRODUK
function renderTable() {
    const query = searchInput.value.trim().toLocaleLowerCase("id-ID");
    const category = categoryFilter.value;

    const filtered = products.filter(product =>
        String(product.name).toLocaleLowerCase("id-ID").includes(query) &&
        (!category || product.category === category)
    );

    if (!filtered.length) {
        productTable.innerHTML = `
            <tr>
                <td colspan="6" class="empty-cell">
                    ${products.length
                        ? "Produk tidak ditemukan."
                        : "Belum ada produk. Klik Tambah Produk untuk mulai mencatat kosmetikmu."
                    }
                </td>
            </tr>
        `;
    } else {
        productTable.innerHTML = filtered.map(product => {
            const status = productStatus(product);
            const days = daysUntilExpiry(product.expiry_date);

            let expiryNote = "";

            if (days !== null && days < 0) {
                expiryNote = `
                    <div class="product-sub">
                        Lewat ${Math.abs(days)} hari
                    </div>
                `;
            } else if (days !== null && days <= EXPIRY_WARNING_DAYS) {
                expiryNote = `
                    <div class="product-sub">
                        ${days === 0
                            ? "Kedaluwarsa hari ini"
                            : `${days} hari lagi`
                        }
                    </div>
                `;
            }

            return `
                <tr>
                    <td>
                        <div class="product-cell">
                            <span class="product-avatar">♡</span>
                            <div>
                                <div class="product-name">
                                    ${escapeHTML(product.name)}
                                </div>
                                <div class="product-sub">
                                    ID #${Number(product.id)}
                                </div>
                            </div>
                        </div>
                    </td>

                    <td>${escapeHTML(product.category)}</td>

                    <td>
                        <span class="stock-number">
                            ${Number(product.quantity)}
                        </span> item
                    </td>

                    <td>
                        ${formatDate(product.expiry_date)}
                        ${expiryNote}
                    </td>

                    <td>
                        <span class="status ${status.className}">
                            ${status.label}
                        </span>
                    </td>

                    <td>
                        <div class="action-group">
                            <button
                                class="icon-button"
                                data-action="edit"
                                data-id="${Number(product.id)}"
                                title="Edit produk"
                            >✎</button>

                            <button
                                class="icon-button delete"
                                data-action="delete"
                                data-id="${Number(product.id)}"
                                title="Hapus produk"
                            >⌫</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    }

    document.getElementById("table-count").textContent =
        `${filtered.length} produk`;
}

// PINDAH HALAMAN
function showPage(page) {
    const isHome = page === "home";

    homePage.classList.toggle("hidden", !isHome);
    formPage.classList.toggle("hidden", isHome);

    pageTitle.textContent = isHome
        ? "Halaman Utama"
        : (
            document.getElementById("product-id").value
                ? "Edit Produk"
                : "Tambah Produk"
        );

    document.querySelectorAll(".nav-item").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === page
        );
    });

    if (isHome) {
        renderDashboard();
        renderTable();
    }
}

// RESET FORM
function resetForm() {
    productForm.reset();

    document.getElementById("product-id").value = "";
    formError.textContent = "";

    document.getElementById("form-heading").textContent =
        "Tambah Produk";

    saveButton.innerHTML =
        'Simpan Produk <span>↗</span>';

    document.getElementById("cancel-edit").textContent =
        "Batal";
}

// TAMBAH PRODUK
function openAddForm() {
    resetForm();
    showPage("form");
}

// EDIT PRODUK
function openEditForm(id) {
    const product = products.find(
        item => Number(item.id) === Number(id)
    );

    if (!product) return;

    resetForm();

    document.getElementById("product-id").value = product.id;
    document.getElementById("product-name").value = product.name;
    document.getElementById("product-category").value = product.category;
    document.getElementById("product-quantity").value = product.quantity;
    document.getElementById("product-expiry").value = product.expiry_date;

    document.getElementById("form-heading").textContent =
        "Edit Produk";

    saveButton.innerHTML =
        'Simpan Perubahan <span>↗</span>';

    showPage("form");

    pageTitle.textContent = "Edit Produk";
}

// NOTIFIKASI
function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 3200);
}

// NAVIGASI
document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
        if (button.dataset.page === "form") {
            openAddForm();
        } else {
            resetForm();
            showPage("home");
        }
    });
});

document.getElementById("hero-add")
    .addEventListener("click", openAddForm);

document.getElementById("cancel-edit")
    .addEventListener("click", () => {
        resetForm();
        showPage("home");
    });

searchInput.addEventListener("input", renderTable);

categoryFilter.addEventListener("change", renderTable);

// EDIT DAN HAPUS PRODUK
productTable.addEventListener("click", async event => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);

    if (button.dataset.action === "edit") {
        openEditForm(id);
        return;
    }

    const product = products.find(
        item => Number(item.id) === id
    );

    if (!product) return;

    if (!confirm(
        `Yakin ingin menghapus produk "${product.name}"?`
    )) {
        return;
    }

    try {
        await apiRequest(API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "delete",
                id: id
            })
        });

        showToast("Produk berhasil dihapus.");

        await loadProducts();

    } catch (error) {
        showToast(error.message);
    }
});

// SIMPAN PRODUK BARU DAN PERUBAHAN
productForm.addEventListener("submit", async event => {
    event.preventDefault();

    formError.textContent = "";

    const id = document.getElementById("product-id").value;
    const name = document.getElementById("product-name").value.trim();
    const category = document.getElementById("product-category").value;
    const quantity = document.getElementById("product-quantity").value;
    const expiryDate = document.getElementById("product-expiry").value;

    if (!name || !category || quantity === "" || !expiryDate) {
        formError.textContent = "Semua kolom wajib diisi.";
        return;
    }

    if (
        !Number.isInteger(Number(quantity)) ||
        Number(quantity) < 0
    ) {
        formError.textContent =
            "Jumlah stok harus berupa bilangan bulat minimal 0.";
        return;
    }

    if (expiryDate < localDateString(new Date())) {
        if (!confirm(
            "Tanggal kedaluwarsa yang dipilih sudah lewat. Tetap simpan produk ini?"
        )) {
            return;
        }
    }

    const payload = {
        action: id ? "update" : "create",
        ...(id ? { id: Number(id) } : {}),
        name: name,
        category: category,
        quantity: Number(quantity),
        expiry_date: expiryDate
    };

    saveButton.disabled = true;
    saveButton.textContent = "Menyimpan...";

    try {
        await apiRequest(API_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        });

        showToast(
            id
                ? "Perubahan produk berhasil disimpan."
                : "Produk berhasil ditambahkan."
        );

        resetForm();

        await loadProducts();

        showPage("home");

    } catch (error) {
        formError.textContent = error.message;

    } finally {
        saveButton.disabled = false;

        saveButton.innerHTML = id
            ? 'Simpan Perubahan <span>↗</span>'
            : 'Simpan Produk <span>↗</span>';
    }
});

// MEMUAT DATA SAAT DASHBOARD DIBUKA
loadProducts();
