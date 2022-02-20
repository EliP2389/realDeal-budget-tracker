let db;
const request = indexedDB.open('real_budget_tracker', 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore('budget_tracker', { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadBudgetTracker();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['budget_tracker'], 'readwrite');
    const pizzaObjectStore = transaction.objectStore('budget_tracker');

    pizzaObjectStore.add(record);
}

function uploadBudgetTracker() {

    const transaction = db.transaction(['budget_tracker'], 'readwrite');
    const pizzaObjectStore = transaction.objectStore('budget_tracker');
    const getAll = pizzaObjectStore.getAll();

    getAll.onsuccess = function () {

        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    const transaction = db.transaction(['budget_tracker'], 'readwrite');
                    const pizzaObjectStore = transaction.objectStore('budget_tracker');

                    pizzaObjectStore.clear();
                })
                .catch(err => {

                    console.log(err);
                });
        }
    };
}


window.addEventListener('online', uploadBudgetTracker);