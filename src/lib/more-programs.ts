export type MoreProgram = {
  id: string;
  name: string;
  note?: string;
  code: string;
};

function program(id: string, name: string, code: string, note?: string): MoreProgram {
  return {
    id,
    name,
    note,
    code: code.replace(/^\n/, "").replace(/\n$/, ""),
  };
}

export const morePrograms: MoreProgram[] = [
  program(
    "1A",
    "Linear Probing",
    `
#include <iostream>
using namespace std;

#define SIZE 10

int table[SIZE];

void insert(int key) {
    int index = key % SIZE;
    int start = index;

    while (table[index] != -1) {
        index = (index + 1) % SIZE;

        if (index == start) {
            cout << "Hash Table Full\\n";
            return;
        }
    }

    table[index] = key;
    cout << "Inserted\\n";
}

void search(int key) {
    int index = key % SIZE;
    int start = index;

    while (table[index] != -1) {
        if (table[index] == key) {
            cout << "Found at index " << index << endl;
            return;
        }

        index = (index + 1) % SIZE;

        if (index == start)
            break;
    }

    cout << "Not Found\\n";
}

void display() {
    for (int i = 0; i < SIZE; i++) {
        cout << i << " : " << table[i] << endl;
    }
}

int main() {
    int ch, key;

    for (int i = 0; i < SIZE; i++)
        table[i] = -1;

    do {
        cout << "\\n1.Insert 2.Search 3.Display 4.Exit\\n";
        cin >> ch;

        switch (ch) {
            case 1:
                cout << "Enter key: ";
                cin >> key;
                insert(key);
                break;

            case 2:
                cout << "Enter key: ";
                cin >> key;
                search(key);
                break;

            case 3:
                display();
                break;
        }
    } while (ch != 4);

    return 0;
}
`,
  ),
  program(
    "1B",
    "Quadratic Probing",
    `
#include <iostream>
using namespace std;

#define SIZE 10

int table[SIZE];

void insert(int key) {
    int h = key % SIZE;

    for (int i = 0; i < SIZE; i++) {
        int index = (h + i * i) % SIZE;

        if (table[index] == -1) {
            table[index] = key;
            cout << "Inserted\\n";
            return;
        }
    }

    cout << "Hash Table Full\\n";
}

void display() {
    for (int i = 0; i < SIZE; i++)
        cout << i << " : " << table[i] << endl;
}

int main() {
    int n, key;

    for (int i = 0; i < SIZE; i++)
        table[i] = -1;

    cout << "Enter number of keys: ";
    cin >> n;

    for (int i = 0; i < n; i++) {
        cout << "Enter key: ";
        cin >> key;
        insert(key);
    }

    cout << "\\nHash Table:\\n";
    display();

    return 0;
}
`,
  ),
  program(
    "1C",
    "Double Hashing",
    `
#include <iostream>
using namespace std;

#define SIZE 10

int table[SIZE];

int hash1(int key) {
    return key % SIZE;
}

int hash2(int key) {
    return 7 - (key % 7);
}

void insert(int key) {
    int h1 = hash1(key);
    int h2 = hash2(key);

    for (int i = 0; i < SIZE; i++) {
        int index = (h1 + i * h2) % SIZE;

        if (table[index] == -1) {
            table[index] = key;
            cout << "Inserted\\n";
            return;
        }
    }

    cout << "Hash Table Full\\n";
}

void display() {
    for (int i = 0; i < SIZE; i++)
        cout << i << " : " << table[i] << endl;
}

int main() {
    int n, key;

    for (int i = 0; i < SIZE; i++)
        table[i] = -1;

    cout << "Enter number of keys: ";
    cin >> n;

    for (int i = 0; i < n; i++) {
        cout << "Enter key: ";
        cin >> key;
        insert(key);
    }

    cout << "\\nHash Table:\\n";
    display();

    return 0;
}
`,
  ),
  program(
    "1D",
    "Separate Chaining",
    `
#include <iostream>
using namespace std;

#define SIZE 10

struct Node {
    int data;
    Node* next;
};

Node* table[SIZE] = {NULL};

void insert(int key) {
    int index = key % SIZE;

    Node* newNode = new Node{key, table[index]};
    table[index] = newNode;

    cout << "Inserted\\n";
}

void search(int key) {
    int index = key % SIZE;
    Node* temp = table[index];

    while (temp != NULL) {
        if (temp->data == key) {
            cout << "Key Found\\n";
            return;
        }

        temp = temp->next;
    }

    cout << "Key Not Found\\n";
}

void display() {
    for (int i = 0; i < SIZE; i++) {
        cout << i << " : ";

        Node* temp = table[i];

        while (temp != NULL) {
            cout << temp->data << " -> ";
            temp = temp->next;
        }

        cout << "NULL\\n";
    }
}

int main() {
    int ch, key;

    do {
        cout << "\\n1.Insert 2.Search 3.Display 4.Exit\\n";
        cin >> ch;

        switch (ch) {
            case 1:
                cout << "Enter key: ";
                cin >> key;
                insert(key);
                break;

            case 2:
                cout << "Enter key: ";
                cin >> key;
                search(key);
                break;

            case 3:
                display();
                break;
        }
    } while (ch != 4);

    return 0;
}
`,
  ),
  program(
    "2A",
    "Call Log Management — Singly Linked List",
    `
#include <iostream>
using namespace std;

struct Node {
    string name;
    string number;
    Node* next;
};

Node* head = NULL;

void addCall() {
    Node* newNode = new Node;

    cout << "Enter name: ";
    cin >> newNode->name;

    cout << "Enter phone number: ";
    cin >> newNode->number;

    newNode->next = NULL;

    if (head == NULL) {
        head = newNode;
    } else {
        Node* temp = head;

        while (temp->next != NULL)
            temp = temp->next;

        temp->next = newNode;
    }

    cout << "Call added\\n";
}

void display() {
    Node* temp = head;

    if (temp == NULL) {
        cout << "No calls\\n";
        return;
    }

    while (temp != NULL) {
        cout << temp->name << " - " << temp->number << endl;
        temp = temp->next;
    }
}

void searchCall() {
    string number;
    cout << "Enter number to search: ";
    cin >> number;

    Node* temp = head;

    while (temp != NULL) {
        if (temp->number == number) {
            cout << "Call found: " << temp->name << endl;
            return;
        }

        temp = temp->next;
    }

    cout << "Call not found\\n";
}

void deleteCall() {
    string number;
    cout << "Enter number to delete: ";
    cin >> number;

    Node* temp = head;
    Node* prev = NULL;

    while (temp != NULL && temp->number != number) {
        prev = temp;
        temp = temp->next;
    }

    if (temp == NULL) {
        cout << "Call not found\\n";
        return;
    }

    if (prev == NULL)
        head = temp->next;
    else
        prev->next = temp->next;

    delete temp;
    cout << "Call deleted\\n";
}

int main() {
    int ch;

    do {
        cout << "\\n1.Add Call";
        cout << "\\n2.Display Calls";
        cout << "\\n3.Search Call";
        cout << "\\n4.Delete Call";
        cout << "\\n5.Exit";
        cout << "\\nEnter choice: ";
        cin >> ch;

        switch (ch) {
            case 1: addCall(); break;
            case 2: display(); break;
            case 3: searchCall(); break;
            case 4: deleteCall(); break;
        }
    } while (ch != 5);

    return 0;
}
`,
    "Add a call, display calls, search by number, and delete a call.",
  ),
  program(
    "2B",
    "Train Reservation System — Doubly Linked List",
    `
#include <iostream>
using namespace std;

struct Node {
    int seat;
    string name;
    Node* prev;
    Node* next;
};

Node* head = NULL;

void insert() {
    Node* newNode = new Node;

    cout << "Enter seat number: ";
    cin >> newNode->seat;

    cout << "Enter passenger name: ";
    cin >> newNode->name;

    newNode->prev = NULL;
    newNode->next = NULL;

    if (head == NULL) {
        head = newNode;
    } else {
        Node* temp = head;

        while (temp->next != NULL)
            temp = temp->next;

        temp->next = newNode;
        newNode->prev = temp;
    }

    cout << "Reservation added\\n";
}

void displayForward() {
    Node* temp = head;

    while (temp != NULL) {
        cout << "Seat: " << temp->seat
             << " Name: " << temp->name << endl;

        temp = temp->next;
    }
}

void displayBackward() {
    if (head == NULL) {
        cout << "No reservations\\n";
        return;
    }

    Node* temp = head;

    while (temp->next != NULL)
        temp = temp->next;

    while (temp != NULL) {
        cout << "Seat: " << temp->seat
             << " Name: " << temp->name << endl;

        temp = temp->prev;
    }
}

void search() {
    int seat;
    cout << "Enter seat number: ";
    cin >> seat;

    Node* temp = head;

    while (temp != NULL) {
        if (temp->seat == seat) {
            cout << "Reservation found: " << temp->name << endl;
            return;
        }

        temp = temp->next;
    }

    cout << "Reservation not found\\n";
}

void cancel() {
    int seat;
    cout << "Enter seat number to cancel: ";
    cin >> seat;

    Node* temp = head;

    while (temp != NULL && temp->seat != seat)
        temp = temp->next;

    if (temp == NULL) {
        cout << "Reservation not found\\n";
        return;
    }

    if (temp->prev != NULL)
        temp->prev->next = temp->next;
    else
        head = temp->next;

    if (temp->next != NULL)
        temp->next->prev = temp->prev;

    delete temp;
    cout << "Reservation cancelled\\n";
}

int main() {
    int ch;

    do {
        cout << "\\n1.Add Reservation";
        cout << "\\n2.Display Forward";
        cout << "\\n3.Display Backward";
        cout << "\\n4.Search";
        cout << "\\n5.Cancel Reservation";
        cout << "\\n6.Exit";
        cout << "\\nEnter choice: ";
        cin >> ch;

        switch (ch) {
            case 1: insert(); break;
            case 2: displayForward(); break;
            case 3: displayBackward(); break;
            case 4: search(); break;
            case 5: cancel(); break;
        }
    } while (ch != 6);

    return 0;
}
`,
    "Add a reservation, display forward and backward, search, and cancel.",
  ),
  program(
    "2C",
    "Music Playlist — Circular Doubly Linked List",
    `
#include <iostream>
using namespace std;

struct Node {
    string song;
    Node* next;
    Node* prev;
};

Node* head = NULL;

void addSong() {
    Node* newNode = new Node;

    cout << "Enter song name: ";
    cin >> newNode->song;

    if (head == NULL) {
        head = newNode;
        newNode->next = head;
        newNode->prev = head;
    } else {
        Node* last = head->prev;

        newNode->next = head;
        newNode->prev = last;

        last->next = newNode;
        head->prev = newNode;
    }

    cout << "Song added\\n";
}

void display() {
    if (head == NULL) {
        cout << "Playlist is empty\\n";
        return;
    }

    Node* temp = head;

    do {
        cout << temp->song << " ";
        temp = temp->next;
    } while (temp != head);

    cout << endl;
}

void nextSong() {
    if (head == NULL) {
        cout << "Playlist is empty\\n";
        return;
    }

    head = head->next;
    cout << "Current song: " << head->song << endl;
}

void previousSong() {
    if (head == NULL) {
        cout << "Playlist is empty\\n";
        return;
    }

    head = head->prev;
    cout << "Current song: " << head->song << endl;
}

void searchSong() {
    string name;
    cout << "Enter song name: ";
    cin >> name;

    if (head == NULL) {
        cout << "Playlist is empty\\n";
        return;
    }

    Node* temp = head;

    do {
        if (temp->song == name) {
            cout << "Song found\\n";
            return;
        }

        temp = temp->next;
    } while (temp != head);

    cout << "Song not found\\n";
}

void deleteSong() {
    string name;
    cout << "Enter song to delete: ";
    cin >> name;

    if (head == NULL) {
        cout << "Playlist is empty\\n";
        return;
    }

    Node* temp = head;

    do {
        if (temp->song == name)
            break;

        temp = temp->next;
    } while (temp != head);

    if (temp->song != name) {
        cout << "Song not found\\n";
        return;
    }

    if (temp->next == temp) {
        head = NULL;
    } else {
        temp->prev->next = temp->next;
        temp->next->prev = temp->prev;

        if (temp == head)
            head = temp->next;
    }

    delete temp;
    cout << "Song deleted\\n";
}

int main() {
    int ch;

    do {
        cout << "\\n1.Add Song";
        cout << "\\n2.Display Playlist";
        cout << "\\n3.Next Song";
        cout << "\\n4.Previous Song";
        cout << "\\n5.Search Song";
        cout << "\\n6.Delete Song";
        cout << "\\n7.Exit";
        cout << "\\nEnter choice: ";
        cin >> ch;

        switch (ch) {
            case 1: addSong(); break;
            case 2: display(); break;
            case 3: nextSong(); break;
            case 4: previousSong(); break;
            case 5: searchSong(); break;
            case 6: deleteSong(); break;
        }
    } while (ch != 7);

    return 0;
}
`,
    "Add a song, display the playlist, move next and previous, search, and delete.",
  ),
  program(
    "3",
    "Student Record Management — Binary Search Tree",
    `
#include <iostream>
using namespace std;

struct Node {
    int roll;
    Node* left;
    Node* right;
};

Node* insert(Node* root, int x) {
    if (root == NULL) {
        Node* newNode = new Node;
        newNode->roll = x;
        newNode->left = NULL;
        newNode->right = NULL;
        return newNode;
    }

    if (x < root->roll)
        root->left = insert(root->left, x);
    else if (x > root->roll)
        root->right = insert(root->right, x);

    return root;
}

void search(Node* root, int x) {
    if (root == NULL) {
        cout << "Student not found\\n";
        return;
    }

    if (root->roll == x) {
        cout << "Student found\\n";
    }
    else if (x < root->roll) {
        search(root->left, x);
    }
    else {
        search(root->right, x);
    }
}

void minimum(Node* root) {
    if (root == NULL) {
        cout << "Tree is empty\\n";
        return;
    }

    while (root->left != NULL)
        root = root->left;

    cout << "Minimum roll number: " << root->roll << endl;
}

void maximum(Node* root) {
    if (root == NULL) {
        cout << "Tree is empty\\n";
        return;
    }

    while (root->right != NULL)
        root = root->right;

    cout << "Maximum roll number: " << root->roll << endl;
}

void inorder(Node* root) {
    if (root != NULL) {
        inorder(root->left);
        cout << root->roll << " ";
        inorder(root->right);
    }
}

void preorder(Node* root) {
    if (root != NULL) {
        cout << root->roll << " ";
        preorder(root->left);
        preorder(root->right);
    }
}

void postorder(Node* root) {
    if (root != NULL) {
        postorder(root->left);
        postorder(root->right);
        cout << root->roll << " ";
    }
}

Node* findMinNode(Node* root) {
    while (root != NULL && root->left != NULL)
        root = root->left;

    return root;
}

Node* deleteNode(Node* root, int x) {
    if (root == NULL)
        return root;

    if (x < root->roll) {
        root->left = deleteNode(root->left, x);
    }
    else if (x > root->roll) {
        root->right = deleteNode(root->right, x);
    }
    else {
        if (root->left == NULL) {
            Node* temp = root->right;
            delete root;
            return temp;
        }

        if (root->right == NULL) {
            Node* temp = root->left;
            delete root;
            return temp;
        }

        Node* temp = findMinNode(root->right);

        root->roll = temp->roll;

        root->right = deleteNode(root->right, temp->roll);
    }

    return root;
}

void predecessorSuccessor(Node* root, int key) {
    Node* pred = NULL;
    Node* succ = NULL;
    Node* current = root;

    while (current != NULL) {
        if (key < current->roll) {
            succ = current;
            current = current->left;
        }
        else if (key > current->roll) {
            pred = current;
            current = current->right;
        }
        else {
            if (current->left != NULL)
                pred = findMaxNode(current->left);

            if (current->right != NULL)
                succ = findMinNode(current->right);

            break;
        }
    }

    if (current == NULL) {
        cout << "Student not found\\n";
        return;
    }

    if (pred != NULL)
        cout << "Predecessor: " << pred->roll << endl;
    else
        cout << "No predecessor\\n";

    if (succ != NULL)
        cout << "Successor: " << succ->roll << endl;
    else
        cout << "No successor\\n";
}

Node* findMaxNode(Node* root) {
    while (root != NULL && root->right != NULL)
        root = root->right;

    return root;
}

int main() {
    Node* root = NULL;
    int ch, x;

    do {
        cout << "\\n\\n1.Insert Student";
        cout << "\\n2.Search Student";
        cout << "\\n3.Minimum Roll Number";
        cout << "\\n4.Maximum Roll Number";
        cout << "\\n5.Delete Student";
        cout << "\\n6.Inorder";
        cout << "\\n7.Preorder";
        cout << "\\n8.Postorder";
        cout << "\\n9.Predecessor and Successor";
        cout << "\\n10.Exit";

        cout << "\\nEnter choice: ";
        cin >> ch;

        switch (ch) {
            case 1:
                cout << "Enter roll number: ";
                cin >> x;
                root = insert(root, x);
                break;

            case 2:
                cout << "Enter roll number to search: ";
                cin >> x;
                search(root, x);
                break;

            case 3:
                minimum(root);
                break;

            case 4:
                maximum(root);
                break;

            case 5:
                cout << "Enter roll number to delete: ";
                cin >> x;
                root = deleteNode(root, x);
                break;

            case 6:
                cout << "Inorder: ";
                inorder(root);
                break;

            case 7:
                cout << "Preorder: ";
                preorder(root);
                break;

            case 8:
                cout << "Postorder: ";
                postorder(root);
                break;

            case 9:
                cout << "Enter roll number: ";
                cin >> x;
                predecessorSuccessor(root, x);
                break;
        }

    } while (ch != 10);

    return 0;
}
`,
    "Insert, search, minimum, maximum, predecessor, successor, delete, and the three traversals.",
  ),
];

export function moreProgramsCode(): string {
  return morePrograms
    .map((item) => {
      const note = item.note ? `\n   ${item.note}` : "";
      return `/* ${item.id}. ${item.name}${note} */\n\n${item.code}`;
    })
    .join("\n\n");
}
