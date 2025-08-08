document.addEventListener("DOMContentLoaded", function () {
    // CBOX jasminemontirola@gmail.com
    const firebaseConfig = {
        apiKey: "AIzaSyARo1Wp1Xgy3lJccK9Z1Dre9hJzAAkkess",
        authDomain: "cbox-8ce72.firebaseapp.com",
        projectId: "cbox-8ce72",
        storageBucket: "cbox-8ce72.firebasestorage.app",
        messagingSenderId: "967956534378",
        appId: "1:967956534378:web:ac45dd49a6559cfa182613",
        measurementId: "G-ZE3WP4RDLL"
    };

    // Initialize Firebase once
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    let sessionId = localStorage.getItem("chatSessionId");
    if (!sessionId) {
        sessionId = Date.now().toString() + "-" + Math.random().toString(36).substring(2);
        localStorage.setItem("chatSessionId", sessionId);
    }

    let isAdmin = false;
    let displayName = "Anonymous";

    // ✅ Prompt name on first use
    function askNameIfNew() {
        db.collection("users").doc(sessionId).get().then(doc => {
            if (doc.exists) {
                displayName = doc.data().name || "Anonymous";
                checkAdmin();
            } else {
                const name = prompt("SET UR NAME to get Access:");
                displayName = name?.trim() || "Anonymous";

                db.collection("users").doc(sessionId).set({
                    name: displayName,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    checkAdmin();
                });
            }
        });
    }

    // 🛡️ Check admin status
    function checkAdmin() {
        db.collection("admin").doc(sessionId).get().then(doc => {
            if (doc.exists && doc.data().isAdmin) {
                isAdmin = true;
                displayName = doc.data().name || "ADMINMARUYA"
                console.log("🔐 Admin mode enabled:", displayName);
            }
            loadMessages();
        });
    }

    // ✉️ Send message
    function sendMessage() {
        const message = document.getElementById("message").value.trim();
        if (!message) return;

        db.collection("messages").add({
            username: displayName,
            message,
            sessionId,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        document.getElementById("message").value = '';
    }

    // 🗑️ Delete (admin only)
    function deleteMessage(id) {
        if (isAdmin && confirm("Delete this message?")) {
            db.collection("messages").doc(id).delete();
        }
    }

    // 🖼️ Render chat
    function renderMessage(doc) {
        const data = doc.data();
        const time = data.timestamp?.toDate().toLocaleTimeString() || '';
        return `
            <p data-id="${doc.id}">
                <strong>${data.username}</strong>: ${data.message}
                <span style="font-size:0.8em; color:#888;">${time}</span>
                ${isAdmin ? `<button onclick="deleteMessage('${doc.id}')">🗑️</button>` : ''}
            </p>`;
    }

    // 🔃 Load all messages
    function loadMessages() {
        db.collection("messages").orderBy("timestamp").onSnapshot(snapshot => {
            const chat = document.getElementById("chat");
            chat.innerHTML = '';
            snapshot.forEach(doc => {
                chat.innerHTML += renderMessage(doc);
            });
            chat.scrollTop = chat.scrollHeight;
        });
    }

    const counterRef = db.collection("visits").doc("main");

    function updateCounter() {
        if (!sessionStorage.getItem("visitorCounted")) {
            counterRef.get().then((doc) => {
                let newCount = 1;
                if (doc.exists) {
                    newCount = doc.data().count + 1;
                }
                counterRef.set({ count: newCount });
                document.getElementById("visitor-counter").textContent = newCount;
                sessionStorage.setItem("visitorCounted", "true");
            }).catch((err) => {
                console.error("Visitor counter error:", err);
                document.getElementById("visitor-counter").textContent = "Offline";
            });
        } else {
            counterRef.get().then((doc) => {
                if (doc.exists) {
                    document.getElementById("visitor-counter").textContent = doc.data().count;
                }
            }).catch((err) => {
                console.error("Visitor counter read error:", err);
                document.getElementById("visitor-counter").textContent = "Offline";
            });
        }
    }

    // ⏯️ Start
    window.sendMessage = sendMessage;
    window.deleteMessage = deleteMessage;
    askNameIfNew(); // kick off name setup
    updateCounter(); // Call the function to update the counter
});