// create a variable to hold the db connection
let db;
// establish a connection to IndexedDb database called 'budget_app' and set
// it to version 1
const request = indexedDB.open('budget_app', 1);
// this event will happen if the db version changes
request.onupgradeneeded = function(event) {
    // save a reference to the db
    var db = event.target.result;
    // create the object store to hold data
    // and auto increment primary key of sorts
    db.createObjectStore('new_budget', { autoIncrement: true });
    // when success
};

request.onsuccess = function(event) {
    // when db is successfullly created with its object store (from onupgradeneeded)
    db = event.target.result;

    // check if app is online, if yes run upload function
    // to send all local data to the db
    if (navigator.onLine) {
        uploadBudget();
    }
};

request.onerror = function(event) {
    // log error
    console.log(event.target.errorCode);
};
// this code is the rules for how to write data to the object store

// this function will happen if we attempt to submit new data
// but there is no internet
function saveRecord(record) {
    // start new transaction with the db to read and write permissions
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // access the object store for `new_budget`
    const budgetObjectStore = transaction.objectStore('new_budget');

    // add record to object store with 'add' method
    budgetObjectStore.add(record);
}

// function to upload budget changes
function uploadBudget () {
    // open a transaction on my db
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // access your object store
    const budgetObjectStore = transaction.objectStore('new_budget');

    // get all records from store and set to variable
    const getAll = budgetObjectStore.getAll();

    // when successful getAll, run this
    getAll.onsuccess = function() {
        //if there is data in the indexeddb store, upload to api
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
                // open one more transaction
                const transaction = db.transaction(['new_budget'], 'readwrite');
                //access the new_budget object store
                const budgetObjectStore = transaction.objectStore('new_budget');
                // clear items in the store
                budgetObjectStore.clear();

                alert('All saved transactions have been submitted');
            })
            .catch(err => {
                console.log(err);
            });
        };
    }
}

// listen for app going back online
window.addEventListener('online', uploadBudget);