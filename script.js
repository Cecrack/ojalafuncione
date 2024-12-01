import { 
    initializeApp 
} from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
// Importar las funciones de Firebase
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-functions.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';


// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBGlP6JI7CnJh-MXVrzNfuZlVDUnW51jHc",
    authDomain: "ganaderia-d357d.firebaseapp.com",
    projectId: "ganaderia-d357d",
    storageBucket: "ganaderia-d357d.firebasestorage.app",
    messagingSenderId: "490392434742",
    appId: "1:490392434742:web:69d99d8ae9787abfb80097",
    measurementId: "G-Q55L8JX9WX"
};

// Inicializa Firebase y la autenticación
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);

let isAuthChecked = false; // Variable para saber si el estado de autenticación ha sido verificado

// Evento para cargar elementos DOM
document.addEventListener("DOMContentLoaded", () => {
    let isAuthChecked = false; // Variable para saber si el estado de autenticación ha sido verificado

    // Verifica el estado de autenticación
    onAuthStateChanged(auth, async (user) => {
        isAuthChecked = true;

        const userInfo = document.querySelector(".user-info span");
        const profileIcon = document.getElementById("profile-icon");
        const loginBtn = document.getElementById("login-btn");
        const createUserBtn = document.getElementById("create-user-btn");
        const logoutBtn = document.getElementById("logout-btn");
        const adminList = document.getElementById("admin-list"); // Área de administradores
        const content = document.getElementById("content"); // Área de contenido principal

        if (user) {
            const idTokenResult = await user.getIdTokenResult();
            const isAdmin = idTokenResult.claims.admin || false;

            if (userInfo) userInfo.textContent = `Bienvenido, ${user.email}`;
            if (profileIcon) profileIcon.style.backgroundImage = "";
            loginBtn.classList.add("hidden");
            createUserBtn.classList.add("hidden");
            logoutBtn.classList.remove("hidden");

            // Si el usuario es administrador
            if (isAdmin) {
                console.log("Usuario con rol de administrador detectado.");
                const adminPanelBtn = document.getElementById("btn-panel");
                if (adminPanelBtn) adminPanelBtn.classList.remove("hidden");

                // Llamar a getUsers solo cuando el usuario es administrador
                getUsers();
            } else {
                // Si no es administrador y está en el panel de administración
                if (window.location.pathname.includes('panelAdministracion.html')) {
                    if (content) {
                        content.innerHTML = `
                            <div class="no-permission">
                                <h2>No tienes permisos para acceder a esta sección.</h2>
                                <p>Por favor, contacta a un administrador para obtener más información.</p>
                            </div>
                        `;
                    }
                    console.log("Usuario no tiene permisos para acceder al panel.");
                }
            }
        } else {
            if (userInfo) userInfo.textContent = "Iniciar sesión";
            if (profileIcon) profileIcon.style.backgroundImage = "none";
            loginBtn.classList.remove("hidden");
            createUserBtn.classList.remove("hidden");
            logoutBtn.classList.add("hidden");

            if (window.location.pathname.includes('panelAdministracion.html')) {
                window.location.href = "/index.html";
            }
        }
    });
    

    const getUsers = () => {
        const adminList = document.getElementById("admin-list");
        const tableBody = document.querySelector("#users-table tbody");
    
        // Simulando los usuarios que vendrían desde Firebase
        const users = [
            { email: 'juanescutia@gmail.com', uid: 'user1',rol:'usuario'},
            { email: 'juancarlo@gmail.com', uid: 'user2',rol:'usuario' },
            { email: 'misrrafan777@gmail.com', uid: 'user3' ,rol:'usuario'},
            { email: 'chaves@gmail.com', uid: 'user4' ,rol:'usuario'},
            { email: 'cecraft1@gmail.com', uid: 'user5',rol:'usuario' },
            { email: 'q@gmail.com', uid: 'user6' ,rol:'usuario'},
            { email: 'h@gmail.com', uid: 'user7',rol:'Administrador' },
            { email: 'fierrosergio2907@gmail.com', uid: 'user8',rol:'usuario'}
        ];
    
        // Agregar los usuarios a la tabla
        users.forEach(user => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.email}</td>
                <td>${user.uid}</td>
                <td>${user.rol}</td>
            `;
            tableBody.appendChild(row);
        });
    };
    
     // Configuración de títulos de página
     const pageTitles = {
        "index.html": "Inicio",
        "inventario.html": "Gestión de Inventario",
        "reportes.html": "Reportes",
        "consulta.html": "Consulta",
        "panelAdministracion.html": "Panel de Administración",
        "perfil.html": "Perfil de Usuario"
    };

    const currentPage = window.location.pathname.split("/").pop();
    const headerTitle = document.getElementById("page-title");
    if (headerTitle && pageTitles[currentPage]) {
        headerTitle.textContent = pageTitles[currentPage];
    }
    // Manejo de modales (abrir/cerrar)
    window.openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add("active");
            document.getElementById("overlay").classList.add("active");
        }
    };

    window.closeModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove("active");
            const activeModals = document.querySelectorAll(".modal.active");
            if (activeModals.length === 0) {
                const overlay = document.getElementById("overlay");
                if (overlay) overlay.classList.remove("active");
            }
        }
    };


    // Manejo del ícono de perfil
    const profileIcon = document.getElementById("profile-icon");
    const profileMenu = document.getElementById("profile-menu");
    if (profileIcon && profileMenu) {
        profileIcon.addEventListener("click", () => {
            profileMenu.classList.toggle("active");
        });
    }

    // Iniciar sesión
    const loginForm = document.getElementById("login-form-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("login-username").value;
            const password = document.getElementById("login-password").value;

            try {
                await signInWithEmailAndPassword(auth, email, password);
                alert("Bienvenido nuevamente!");
                closeModal("login-form");
            } catch (error) {
                alert(`Error al iniciar sesión: ${error.message}`);
            }
        });
    }

    // Crear un nuevo usuario
    const createUserForm = document.getElementById("create-user-form-form");
    if (createUserForm) {
        createUserForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("create-email").value;
            const password = document.getElementById("create-password").value;
            const confirmPassword = document.getElementById("create-confirm-password").value;

            if (password.length < 6) {
                alert("La contraseña debe tener al menos 6 caracteres.");
                return;
            }

            if (password !== confirmPassword) {
                alert("Las contraseñas no coinciden.");
                return;
            }

            try {
                await createUserWithEmailAndPassword(auth, email, password);
                alert("Cuenta creada exitosamente. Ahora puedes iniciar sesión.");
                closeModal("create-user-form");
            } catch (error) {
                alert(`Error al crear usuario: ${error.message}`);
            }
        });
    }

  

    // Manejo del botón del Panel de Administración
const adminPanelBtn = document.getElementById("btn-panel");
if (adminPanelBtn) {
    adminPanelBtn.addEventListener("click", async () => {
        const currentPage = window.location.pathname.split("/").pop();
        if (isAuthChecked && auth.currentUser) {
            // Verificar si el usuario tiene el rol de administrador
            const user = auth.currentUser;
            const idTokenResult = await user.getIdTokenResult();
            const isAdmin = idTokenResult.claims.admin || false;

            if (isAdmin) {
                // Si es administrador, redirigir al panel de administración
                window.location.href = currentPage === 'index.html' ? 'screens/panelAdministracion.html' : '../screens/panelAdministracion.html';
            } else {
              
            }
        } else {
        
        }
    });
}
    // Cerrar sesión
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await signOut(auth);
            alert("Has cerrado sesión.");
            window.location.href = "/index.html";
        });
    }
    
    // Manejo del menú lateral en móviles
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show'); // Agregar o quitar la clase "show"
        });
    }
});
