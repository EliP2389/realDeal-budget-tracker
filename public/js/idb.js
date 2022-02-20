let db;
const request = indexedDB.open('budget_tracker', 1);

request.onupgradedneeded = function(e) {
    const db = e.target.result;
    db.createObjectStore('budget_store', {autoIncrement: true});
};

request.onsuccess = function(e) {
    db = e.target.result;

    if (navigator.onLine) {
    //  uploadBudgetTracker();
    }
};

request.onerror = function(e) {
    console.log(e.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['budget_store'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('budget_store');

    budgetObjectStore.add(record);
};

function uploadBudgetTracker() {
    const transaction = db.transaction(['budget_store'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('budget_store');

    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
          fetch('/api/transaction/bulk', {
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
              const transaction = db.transaction(['budget_store'], 'readwrite');
              
              const budgetObjectStore = transaction.objectStore('budget_store');
              
              budgetObjectStore.clear();
    
              alert('All saved transactions has been submitted!');
            })
            .catch(err => {
              console.log(err);
            });
        }
      };
    
};
window.addEventListener('online', uploadBudgetTracker);