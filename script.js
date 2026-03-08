// --- 1. KONFIGURASI & DATABASE ---
const adminWA = "082139874227"; 
const passwordAdmin = "DUELIN2026"; 
let isAdmin = false; 

// Load Data dari LocalStorage
let allTournaments = JSON.parse(localStorage.getItem('duelIn_DB')) || [];
let usersDB = JSON.parse(localStorage.getItem('duelIn_Users')) || []; 
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// --- 2. SISTEM MEMBER (LOGIN & DAFTAR) ---

function saveProfile() {
    const nick = document.getElementById('regNickname').value;
    const wa = document.getElementById('regWA').value;
    
    if(!nick || !wa) return alert("Isi Nickname & WA dulu Bos!");

    // Cek apakah nomor sudah terdaftar
    let user = usersDB.find(u => u.wa === wa);
    if(user) return alert("Nomor WA sudah terdaftar, silakan klik LOGIN!");

    const pass = prompt("Buat Password Akun Bos:");
    if(!pass) return;

    const newUser = {
        id: "D-IN" + Math.floor(1000 + Math.random() * 8999),
        nickname: nick,
        wa: wa,
        password: pass,
        status: "Online",
        activity: "HOME",
        lastSeen: Date.now()
    };

    usersDB.push(newUser);
    localStorage.setItem('duelIn_Users', JSON.stringify(usersDB));
    loginProcess(wa, pass);
    alert("Akun Berhasil Dibuat! ID: " + newUser.id);
}

function loginProcess(wa, pass) {
    if(!wa || !pass) return alert("Data login tidak lengkap!");
    
    const user = usersDB.find(u => u.wa === wa && u.password === pass);
    if(user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        renderProfile();
        showPage('home');
    } else {
        alert("WA atau Password Salah!");
    }
}

function logoutProfile() {
    if(currentUser) {
        updateActivity("OFFLINE");
    }
    localStorage.removeItem('currentUser');
    location.reload();
}

// --- 3. TRACKER AKTIVITAS (MONITORING) ---

function updateActivity(pageName) {
    if(!currentUser) return;
    const idx = usersDB.findIndex(u => u.wa === currentUser.wa);
    if(idx !== -1) {
        usersDB[idx].activity = pageName.toUpperCase();
        usersDB[idx].lastSeen = Date.now();
        localStorage.setItem('duelIn_Users', JSON.stringify(usersDB));
    }
}

// Pantau setiap 15 detik agar Admin tahu player masih aktif
setInterval(() => {
    if(currentUser) updateActivity(document.querySelector('.page.active').id.replace('page', ''));
}, 15000);

// --- 4. NAVIGASI ---

function toggleSidebar() {
    const sb = document.getElementById("sidebar");
    // Kalau lebar 0, kasih 250px. Kalau sudah ada isinya, balikin ke 0.
    if (sb.style.width === "250px") {
        sb.style.width = "0";
    } else {
        sb.style.width = "250px";
    }
}

function showPage(pId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    const target = document.getElementById(pId);
    if(target) target.classList.add('active');
    
    // Update warna icon nav bawah
    const navs = document.querySelectorAll('.nav-item');
    if(pId === 'home') navs[0].classList.add('active');
    else if(pId === 'pageTournament') navs[1].classList.add('active');
    else if(pId === 'pageShop') navs[2].classList.add('active');
    else if(pId === 'pageProfil') navs[3].classList.add('active');

    updateActivity(pId.replace('page', ''));
    const sb = document.getElementById("sidebar");
    sb.style.width = "0";
    window.scrollTo(0, 0);
}

// --- 5. ADMIN CORE (MODE DASHBOARD FULLSCREEN) ---

function checkAdminPassword() {
    const input = document.getElementById('passAdminInput').value;
    
    if(input === passwordAdmin) { // Passwordnya DUELIN2026
        isAdmin = true;
        
        // Tampilkan layar penuh Dashboard
        document.getElementById('adminDashboard').style.display = 'block';
        
        // Isi data statistik dan monitor secara live
        renderAdminDashboard();
        
        // Biar bracket bisa diedit di halaman Tournament
        renderAll(); 
        
        alert("Akses Diterima, Bos!");
    } else {
        alert("Password Salah!");
    }
}

function exitAdmin() {
    isAdmin = false;
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('passAdminInput').value = '';
    renderAll(); // Kunci lagi bracket-nya buat player
}

// Fungsi Isi Data Dashboard (Player Online dll)
function renderAdminDashboard() {
    if(!isAdmin) return;

    const now = Date.now();
    const onlineUsers = usersDB.filter(u => u.lastSeen > (now - 60000));
    
    // Update angka statistik
    if(document.getElementById('statOnline')) document.getElementById('statOnline').innerText = onlineUsers.length;
    if(document.getElementById('statTotalUser')) document.getElementById('statTotalUser').innerText = usersDB.length;

    // Update List Monitor
    const table = document.getElementById('monitorTable');
    if(table) {
        table.innerHTML = '';
        if(onlineUsers.length === 0) {
            table.innerHTML = '<p style="text-align:center; color:#444; padding:10px;">Belum ada player online...</p>';
        } else {
            onlineUsers.forEach(u => {
                table.innerHTML += `
                    <div class="player-row" style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #222;">
                        <div>
                            <b style="color:var(--gold);">${u.nickname}</b><br>
                            <small style="color:#555;">ID: ${u.id}</small>
                        </div>
                        <div style="color:var(--cyan); font-weight:bold; font-size:0.7rem;">${u.activity || 'HOME'}</div>
                    </div>
                `;
            });
        }
    }
}

// Loop update otomatis tiap 5 detik
setInterval(() => {
    if(isAdmin) renderAdminDashboard();
}, 5000);

function adminMonitorPlayers() {
    const limit = Date.now() - 60000; // Aktif 1 menit terakhir
    const online = usersDB.filter(u => u.lastSeen > limit);
    
    let list = "📊 PLAYER ONLINE SAAT INI:\n\n";
    if(online.length === 0) list += "Tidak ada player aktif.";
    
    online.forEach((u, i) => {
        list += `${i+1}. ${u.nickname} (${u.id})\n   📍 Sedang di: ${u.activity}\n\n`;
    });
    
    alert(list);
    console.table(online);
}

// --- 6. TOURNAMENT & BRACKET LOGIC ---

function adminCreateTournament() {
    const name = prompt("Nama Turnamen:", "NIGHT BATTLE");
    const size = prompt("Slot Tim (4/8/16):", "8");
    if(name && [4,8,16].includes(parseInt(size))) {
        allTournaments.push({ id: Date.now(), name, size: parseInt(size), status: 'active', data: {} });
        saveAndRender();
    }
}

function updateTeamName(tourId, field, val) {
    const t = allTournaments.find(x => x.id === tourId);
    if(t) {
        t.data[field] = val;
        localStorage.setItem('duelIn_DB', JSON.stringify(allTournaments));
    }
}

function saveAndRender() {
    localStorage.setItem('duelIn_DB', JSON.stringify(allTournaments));
    renderAll();
}

function renderAll() {
    const actArea = document.getElementById('activeList');
    const finArea = document.getElementById('finishedList');
    if(!actArea) return;

    actArea.innerHTML = '';
    finArea.innerHTML = '';

    allTournaments.forEach(t => {
        const card = document.createElement('div');
        card.className = 'tournament-card';
        
        let adminBtns = isAdmin ? `
            <div style="display:flex; gap:5px; margin-bottom:10px;">
                <button onclick="deleteTour(${t.id})" style="background:red; color:#fff; border:none; padding:5px 10px; border-radius:4px; font-size:10px;">HAPUS</button>
            </div>` : '';

        card.innerHTML = `
            <div class="card-header" style="margin-bottom:15px; border-bottom:1px solid #222; padding-bottom:10px;">
                <span style="color:var(--gold); font-weight:bold;">${t.name}</span>
                ${adminBtns}
            </div>
            <div id="bracket-${t.id}" class="bracket-wrapper"></div>
        `;

        if(t.status === 'active') actArea.appendChild(card);
        else finArea.appendChild(card);
        
        renderSingleBracket(t);
    });
}

function renderSingleBracket(tour) {
    const area = document.getElementById(`bracket-${tour.id}`);
    const rounds = Math.log2(tour.size);
    let html = '';

    for (let r = 0; r <= rounds; r++) {
        let matches = Math.pow(2, rounds - r - 1);
        if (matches < 1 && r !== rounds) continue;
        
        let rName = (r === rounds) ? "WINNER" : (r === rounds - 1) ? "FINAL" : `ROUND ${r + 1}`;
        html += `<div class="round"><div class="round-title">${rName}</div>`;

        if (r === rounds) {
            html += `<div class="match-box" style="border-color:var(--gold);"><div class="team-slot">
                <input class="b-input" ${!isAdmin?'readonly':''} placeholder="👑" value="${tour.data['win'] || ''}" onchange="updateTeamName(${tour.id}, 'win', this.value)">
            </div></div>`;
        } else {
            for (let m = 0; m < matches; m++) {
                const t1 = `r${r}m${m}t1`, t2 = `r${r}m${m}t2`;
                html += `<div class="match-box">
                    <div class="team-slot"><input class="b-input" ${!isAdmin?'readonly':''} placeholder="Tim" value="${tour.data[t1] || ''}" onchange="updateTeamName(${tour.id}, '${t1}', this.value)"></div>
                    <div class="team-slot"><input class="b-input" ${!isAdmin?'readonly':''} placeholder="Tim" value="${tour.data[t2] || ''}" onchange="updateTeamName(${tour.id}, '${t2}', this.value)"></div>
                </div>`;
            }
        }
        html += `</div>`;
    }
    area.innerHTML = html;
}

function deleteTour(id) {
    if(confirm("Hapus turnamen ini, Bos?")) {
        allTournaments = allTournaments.filter(t => t.id !== id);
        saveAndRender();
    }
}

// --- 7. INITIALIZE ---

function renderProfile() {
    const unreg = document.getElementById('unregisteredProfile');
    const reg = document.getElementById('registeredProfile');
    
    if(currentUser) {
        // Jika sudah login, sembunyikan Form Daftar, munculkan ID Card
        unreg.style.display = 'none';
        reg.style.display = 'block';
        
        document.getElementById('userDisplayName').innerText = currentUser.nickname;
        document.getElementById('userDisplayWA').innerText = `ID: ${currentUser.id} | ${currentUser.wa}`;
    } else {
        // Jika belum login, munculkan Form Daftar, sembunyikan ID Card
        unreg.style.display = 'block';
        reg.style.display = 'none';
    }
}

function buyItem(item, type) {
    if(!currentUser) return alert("Login dulu Bos kalau mau borong Gold Bar!");
    const text = `Halo Admin!\nSaya ${currentUser.nickname} (ID:${currentUser.id})\nMau beli item di Store.\n\nItem: ${item}\n\nMohon info cara pembayarannya, Bos! 🪙`;
    window.open(`https://wa.me/${adminWA}?text=${encodeURIComponent(text)}`);
}

document.addEventListener('DOMContentLoaded', () => {
    renderProfile();
    renderAll();
    
    // Auto load poster jika ada
    const saved = localStorage.getItem('savedPoster');
    if(saved && document.getElementById('outputPoster')) {
        document.getElementById('outputPoster').src = saved;
    }
});