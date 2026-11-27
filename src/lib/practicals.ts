export type Program = {
  name: string;
  note?: string;
  code: string;
};

export type Practical = {
  number: string;
  title: string;
  summary: string;
  note?: string;
  programs: Program[];
};

function program(name: string, code: string, note?: string): Program {
  return {
    name,
    note,
    code: code.replace(/^\n/, "").replace(/\n$/, ""),
  };
}

export function programText(item: Program): string {
  return [item.name, item.note, item.code].filter(Boolean).join("\n");
}

export const practicals: Practical[] = [
  {
    number: "1",
    title: "Operations on Array",
    summary: "Insertion, deletion, update, and traversal.",
    programs: [
      program(
        "Insertion in an Array",
        `
#include <iostream>
using namespace std;

int main() {
    int a[100], size, pos, element;

    cout << "Enter number of elements: ";
    cin >> size;

    cout << "Enter elements: ";
    for (int i = 0; i < size; i++)
        cin >> a[i];

    cout << "Enter position to insert (0-based): ";
    cin >> pos;

    cout << "Enter element: ";
    cin >> element;

    if (pos < 0 || pos > size || size >= 100) {
        cout << "Invalid position or array full";
    } else {
        for (int i = size - 1; i >= pos; i--)
            a[i + 1] = a[i];

        a[pos] = element;
        size++;

        cout << "Array after insertion: ";
        for (int i = 0; i < size; i++)
            cout << a[i] << " ";
    }

    return 0;
}
`,
      ),
      program(
        "Deletion from an Array",
        `
#include <iostream>
using namespace std;

int main() {
    int a[100], size, pos;

    cout << "Enter number of elements: ";
    cin >> size;

    cout << "Enter elements: ";
    for (int i = 0; i < size; i++)
        cin >> a[i];

    cout << "Enter position to delete (0-based): ";
    cin >> pos;

    if (pos < 0 || pos >= size) {
        cout << "Invalid position";
    } else {
        for (int i = pos; i < size - 1; i++)
            a[i] = a[i + 1];

        size--;

        cout << "Array after deletion: ";
        for (int i = 0; i < size; i++)
            cout << a[i] << " ";
    }

    return 0;
}
`,
      ),
      program(
        "Updation in an Array",
        `
#include <iostream>
using namespace std;

int main() {
    int arr[100], size, pos, newValue;

    cout << "Enter number of elements: ";
    cin >> size;

    cout << "Enter elements: ";
    for (int i = 0; i < size; i++)
        cin >> arr[i];

    cout << "Enter position to update (0-based): ";
    cin >> pos;

    cout << "Enter new value: ";
    cin >> newValue;

    if (pos >= 0 && pos < size) {
        arr[pos] = newValue;

        cout << "Array after updation: ";
        for (int i = 0; i < size; i++)
            cout << arr[i] << " ";
    } else {
        cout << "Invalid position";
    }

    return 0;
}
`,
      ),
      program(
        "Traversal of an Array",
        `
#include <iostream>
using namespace std;

int main() {
    int arr[5];

    cout << "Enter 5 elements: ";
    for (int i = 0; i < 5; i++)
        cin >> arr[i];

    cout << "Array elements are: ";
    for (int i = 0; i < 5; i++)
        cout << arr[i] << " ";

    return 0;
}
`,
      ),
    ],
  },
  {
    number: "2",
    title: "Hashing",
    summary: "Linear probing, quadratic probing, double hashing, and separate chaining.",
    programs: [
      program(
        "Linear Probing",
        `
#include <iostream>
using namespace std;

#define SIZE 10

int main() {
    int table[SIZE];

    for (int i = 0; i < SIZE; i++)
        table[i] = -1;

    int n, key;

    cout << "Enter number of keys: ";
    cin >> n;

    for (int k = 0; k < n; k++) {
        cout << "Enter key: ";
        cin >> key;

        int index = key % SIZE;
        int start = index;

        while (table[index] != -1) {
            index = (index + 1) % SIZE;

            if (index == start) {
                cout << "Hash table is full\\n";
                break;
            }
        }

        if (table[index] == -1)
            table[index] = key;
    }

    cout << "\\nLinear Probing Table:\\n";
    for (int i = 0; i < SIZE; i++)
        cout << "table[" << i << "] = " << table[i] << endl;

    return 0;
}
`,
      ),
      program(
        "Quadratic Probing",
        `
#include <iostream>
using namespace std;

#define SIZE 10

int main() {
    int table[SIZE];

    for (int i = 0; i < SIZE; i++)
        table[i] = -1;

    int n, key;

    cout << "Enter number of keys: ";
    cin >> n;

    for (int k = 0; k < n; k++) {
        cout << "Enter key: ";
        cin >> key;

        int index = key % SIZE;
        int i = 0;

        while (i < SIZE &&
               table[(index + i * i) % SIZE] != -1) {
            i++;
        }

        if (i == SIZE) {
            cout << "No empty position found\\n";
        } else {
            table[(index + i * i) % SIZE] = key;
        }
    }

    cout << "\\nQuadratic Probing Table:\\n";
    for (int i = 0; i < SIZE; i++)
        cout << "table[" << i << "] = " << table[i] << endl;

    return 0;
}
`,
      ),
      program(
        "Double Hashing",
        `
#include <iostream>
using namespace std;

#define SIZE 10

int main() {
    int table[SIZE];

    for (int i = 0; i < SIZE; i++)
        table[i] = -1;

    int n, key;

    cout << "Enter number of keys: ";
    cin >> n;

    for (int k = 0; k < n; k++) {
        cout << "Enter key: ";
        cin >> key;

        int index = key % SIZE;
        int step = 7 - (key % 7);
        int i = 0;

        while (i < SIZE &&
               table[(index + i * step) % SIZE] != -1) {
            i++;
        }

        if (i == SIZE) {
            cout << "Hash table is full\\n";
        } else {
            table[(index + i * step) % SIZE] = key;
        }
    }

    cout << "\\nDouble Hashing Table:\\n";
    for (int i = 0; i < SIZE; i++)
        cout << "table[" << i << "] = " << table[i] << endl;

    return 0;
}
`,
      ),
      program(
        "Separate Chaining",
        `
#include <iostream>
#include <vector>
using namespace std;

#define SIZE 10

int main() {
    vector<int> table[SIZE];

    int n, key;

    cout << "Enter number of keys: ";
    cin >> n;

    for (int i = 0; i < n; i++) {
        cout << "Enter key: ";
        cin >> key;

        int index = key % SIZE;
        table[index].push_back(key);
    }

    cout << "\\nSeparate Chaining Table:\\n";

    for (int i = 0; i < SIZE; i++) {
        cout << "table[" << i << "]: ";

        for (int val : table[i])
            cout << val << " -> ";

        cout << "NULL\\n";
    }

    return 0;
}
`,
      ),
    ],
  },
  {
    number: "3",
    title: "Phone Book Management",
    summary:
      "Insertion sort, selection sort, quick sort, merge sort, sentinel search, and sorted insertion in one menu.",
    note: "Sentinel search is a searching technique, not a sorting algorithm. The search checks that the phone book is not empty before it runs.",
    programs: [
      program(
        "Phone Book Management",
        `
#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

struct Friend {
    string name;
    string mobile;
};

Friend phoneBook[100];
int n = 0;

void insertionSort() {
    for (int i = 1; i < n; i++) {
        Friend temp = phoneBook[i];
        int j = i - 1;

        while (j >= 0 && phoneBook[j].name > temp.name) {
            phoneBook[j + 1] = phoneBook[j];
            j--;
        }

        phoneBook[j + 1] = temp;
    }
}

void selectionSort() {
    for (int i = 0; i < n - 1; i++) {
        int minIndex = i;

        for (int j = i + 1; j < n; j++) {
            if (phoneBook[j].name < phoneBook[minIndex].name)
                minIndex = j;
        }

        swap(phoneBook[i], phoneBook[minIndex]);
    }
}

int partitionArray(int low, int high) {
    string pivot = phoneBook[high].name;
    int i = low - 1;

    for (int j = low; j < high; j++) {
        if (phoneBook[j].name < pivot) {
            i++;
            swap(phoneBook[i], phoneBook[j]);
        }
    }

    swap(phoneBook[i + 1], phoneBook[high]);
    return i + 1;
}

void quickSort(int low, int high) {
    if (low < high) {
        int p = partitionArray(low, high);
        quickSort(low, p - 1);
        quickSort(p + 1, high);
    }
}

void merge(int low, int mid, int high) {
    Friend temp[100];

    int i = low;
    int j = mid + 1;
    int k = low;

    while (i <= mid && j <= high) {
        if (phoneBook[i].name < phoneBook[j].name)
            temp[k++] = phoneBook[i++];
        else
            temp[k++] = phoneBook[j++];
    }

    while (i <= mid)
        temp[k++] = phoneBook[i++];

    while (j <= high)
        temp[k++] = phoneBook[j++];

    for (int x = low; x <= high; x++)
        phoneBook[x] = temp[x];
}

void mergeSort(int low, int high) {
    if (low < high) {
        int mid = (low + high) / 2;

        mergeSort(low, mid);
        mergeSort(mid + 1, high);
        merge(low, mid, high);
    }
}

void display() {
    if (n == 0) {
        cout << "Phone book is empty\\n";
        return;
    }

    for (int i = 0; i < n; i++) {
        cout << phoneBook[i].name
             << " - " << phoneBook[i].mobile << endl;
    }
}

void sentinelSearch() {
    if (n == 0) {
        cout << "Phone book is empty\\n";
        return;
    }

    string name;
    cout << "Enter name to search: ";
    cin >> name;

    Friend last = phoneBook[n - 1];

    phoneBook[n - 1].name = name;

    int i = 0;

    while (phoneBook[i].name != name)
        i++;

    phoneBook[n - 1] = last;

    if (i < n - 1 || last.name == name) {
        cout << "Name: " << phoneBook[i].name << endl;
        cout << "Mobile: " << phoneBook[i].mobile << endl;
    } else {
        cout << "Friend not found\\n";
    }
}

void addFriend() {
    if (n >= 100) {
        cout << "Phone book is full\\n";
        return;
    }

    Friend f;

    cout << "Enter name: ";
    cin >> f.name;

    cout << "Enter mobile number: ";
    cin >> f.mobile;

    int pos = 0;

    while (pos < n && phoneBook[pos].name < f.name)
        pos++;

    for (int j = n; j > pos; j--)
        phoneBook[j] = phoneBook[j - 1];

    phoneBook[pos] = f;
    n++;

    cout << "Friend added\\n";
}

int main() {
    cout << "Enter number of friends: ";
    cin >> n;

    if (n < 0 || n > 100) {
        cout << "Invalid number of friends\\n";
        return 0;
    }

    for (int i = 0; i < n; i++) {
        cout << "Enter name: ";
        cin >> phoneBook[i].name;

        cout << "Enter mobile: ";
        cin >> phoneBook[i].mobile;
    }

    int choice;

    do {
        cout << "\\n--- PHONE BOOK MANAGEMENT ---\\n";
        cout << "1. Insertion Sort\\n";
        cout << "2. Selection Sort\\n";
        cout << "3. Quick Sort\\n";
        cout << "4. Merge Sort\\n";
        cout << "5. Sentinel Search\\n";
        cout << "6. Display\\n";
        cout << "7. Add Friend\\n";
        cout << "8. Exit\\n";

        cout << "Enter choice: ";
        cin >> choice;

        switch (choice) {
            case 1:
                insertionSort();
                display();
                break;

            case 2:
                selectionSort();
                display();
                break;

            case 3:
                quickSort(0, n - 1);
                display();
                break;

            case 4:
                mergeSort(0, n - 1);
                display();
                break;

            case 5:
                sentinelSearch();
                break;

            case 6:
                display();
                break;

            case 7:
                addFriend();
                break;

            case 8:
                cout << "Exiting...\\n";
                break;

            default:
                cout << "Invalid choice\\n";
        }

    } while (choice != 8);

    return 0;
}
`,
      ),
    ],
  },
  {
    number: "4",
    title: "Linked List Implementation for Real-World Applications",
    summary: "Singly, doubly, and circular doubly linked lists.",
    programs: [
      program(
        "Call Log Management — Singly Linked List",
        `
#include <iostream>
#include <string>
using namespace std;

class Node {
public:
    string name, phone;
    int duration;
    Node* next;

    Node(string n, string p, int d) {
        name = n;
        phone = p;
        duration = d;
        next = NULL;
    }
};

class CallLog {
    Node* head;

public:
    CallLog() {
        head = NULL;
    }

    void addCall() {
        string name, phone;
        int duration;

        cout << "Enter caller name: ";
        cin >> name;

        cout << "Enter phone number: ";
        cin >> phone;

        cout << "Enter call duration: ";
        cin >> duration;

        Node* newNode = new Node(name, phone, duration);

        if (head == NULL) {
            head = newNode;
        } else {
            Node* temp = head;

            while (temp->next != NULL)
                temp = temp->next;

            temp->next = newNode;
        }

        cout << "Call added successfully\\n";
    }

    void deleteCall() {
        if (head == NULL) {
            cout << "Call log is empty\\n";
            return;
        }

        Node* temp = head;
        head = head->next;

        delete temp;
        cout << "Call deleted successfully\\n";
    }

    void displayCalls() {
        if (head == NULL) {
            cout << "No call records\\n";
            return;
        }

        Node* temp = head;

        while (temp != NULL) {
            cout << "\\nName: " << temp->name;
            cout << "\\nPhone: " << temp->phone;
            cout << "\\nDuration: " << temp->duration << " minutes\\n";

            temp = temp->next;
        }
    }
};

int main() {
    CallLog log;
    int choice;

    do {
        cout << "\\n--- CALL LOG MANAGEMENT ---\\n";
        cout << "1. Add New Call\\n";
        cout << "2. Delete Call\\n";
        cout << "3. Display Call Logs\\n";
        cout << "4. Exit\\n";

        cout << "Enter choice: ";
        cin >> choice;

        switch (choice) {
            case 1:
                log.addCall();
                break;

            case 2:
                log.deleteCall();
                break;

            case 3:
                log.displayCalls();
                break;

            case 4:
                cout << "Exiting...\\n";
                break;

            default:
                cout << "Invalid choice\\n";
        }

    } while (choice != 4);

    return 0;
}
`,
        "Add a call, delete a call, and display the log.",
      ),
      program(
        "Train Reservation System — Doubly Linked List",
        `
#include <iostream>
#include <string>
using namespace std;

struct Node {
    string name;
    int trainNo, seatNo;
    Node* prev;
    Node* next;
};

Node* head = NULL;
Node* tail = NULL;

void bookTicket() {
    Node* newNode = new Node;

    cout << "Enter passenger name: ";
    cin >> newNode->name;

    cout << "Enter train number: ";
    cin >> newNode->trainNo;

    cout << "Enter seat number: ";
    cin >> newNode->seatNo;

    newNode->prev = NULL;
    newNode->next = NULL;

    if (head == NULL) {
        head = tail = newNode;
    } else {
        tail->next = newNode;
        newNode->prev = tail;
        tail = newNode;
    }

    cout << "Ticket booked successfully\\n";
}

void cancelTicket() {
    if (head == NULL) {
        cout << "No reservations available\\n";
        return;
    }

    int seat;
    cout << "Enter seat number to cancel: ";
    cin >> seat;

    Node* temp = head;

    while (temp != NULL && temp->seatNo != seat)
        temp = temp->next;

    if (temp == NULL) {
        cout << "Ticket not found\\n";
        return;
    }

    if (temp == head)
        head = temp->next;
    else
        temp->prev->next = temp->next;

    if (temp == tail)
        tail = temp->prev;
    else
        temp->next->prev = temp->prev;

    delete temp;
    cout << "Ticket cancelled successfully\\n";
}

void displayForward() {
    Node* temp = head;

    if (temp == NULL) {
        cout << "No reservations\\n";
        return;
    }

    while (temp != NULL) {
        cout << "\\nName: " << temp->name;
        cout << "\\nTrain No: " << temp->trainNo;
        cout << "\\nSeat No: " << temp->seatNo << endl;

        temp = temp->next;
    }
}

void displayBackward() {
    Node* temp = tail;

    if (temp == NULL) {
        cout << "No reservations\\n";
        return;
    }

    while (temp != NULL) {
        cout << "\\nName: " << temp->name;
        cout << "\\nTrain No: " << temp->trainNo;
        cout << "\\nSeat No: " << temp->seatNo << endl;

        temp = temp->prev;
    }
}

int main() {
    int choice;

    do {
        cout << "\\n--- TRAIN RESERVATION SYSTEM ---\\n";
        cout << "1. Book Ticket\\n";
        cout << "2. Cancel Ticket\\n";
        cout << "3. Display Forward\\n";
        cout << "4. Display Backward\\n";
        cout << "5. Exit\\n";

        cout << "Enter choice: ";
        cin >> choice;

        switch (choice) {
            case 1:
                bookTicket();
                break;

            case 2:
                cancelTicket();
                break;

            case 3:
                displayForward();
                break;

            case 4:
                displayBackward();
                break;

            case 5:
                cout << "Exiting...\\n";
                break;

            default:
                cout << "Invalid choice\\n";
        }

    } while (choice != 5);

    return 0;
}
`,
        "Book a ticket, cancel a ticket, and display the list forward and backward.",
      ),
      program(
        "Music Playlist Management — Circular Doubly Linked List",
        `
#include <iostream>
#include <string>
using namespace std;

struct Song {
    string title, artist;
    int duration;
    Song* next;
    Song* prev;

    Song(string t, string a, int d) {
        title = t;
        artist = a;
        duration = d;
        next = prev = NULL;
    }
};

Song* head = NULL;

void insertAtBeginning(string title, string artist, int duration) {
    Song* newNode = new Song(title, artist, duration);

    if (head == NULL) {
        head = newNode;
        newNode->next = newNode;
        newNode->prev = newNode;
    } else {
        Song* tail = head->prev;

        newNode->next = head;
        newNode->prev = tail;

        tail->next = newNode;
        head->prev = newNode;

        head = newNode;
    }

    cout << "Song added at beginning\\n";
}

void insertAtEnd(string title, string artist, int duration) {
    Song* newNode = new Song(title, artist, duration);

    if (head == NULL) {
        head = newNode;
        newNode->next = newNode;
        newNode->prev = newNode;
    } else {
        Song* tail = head->prev;

        newNode->next = head;
        newNode->prev = tail;

        tail->next = newNode;
        head->prev = newNode;
    }

    cout << "Song added at end\\n";
}

void searchTitle(string title) {
    if (head == NULL) {
        cout << "Playlist is empty\\n";
        return;
    }

    Song* temp = head;

    do {
        if (temp->title == title) {
            cout << "Title: " << temp->title << endl;
            cout << "Artist: " << temp->artist << endl;
            cout << "Duration: " << temp->duration << " seconds\\n";
            return;
        }

        temp = temp->next;
    } while (temp != head);

    cout << "Song not found\\n";
}

void displayForward() {
    if (head == NULL) {
        cout << "Playlist is empty\\n";
        return;
    }

    Song* temp = head;

    do {
        cout << temp->title << " - "
             << temp->artist << " - "
             << temp->duration << " seconds\\n";

        temp = temp->next;
    } while (temp != head);
}

void displayBackward() {
    if (head == NULL) {
        cout << "Playlist is empty\\n";
        return;
    }

    Song* tail = head->prev;
    Song* temp = tail;

    do {
        cout << temp->title << " - "
             << temp->artist << " - "
             << temp->duration << " seconds\\n";

        temp = temp->prev;
    } while (temp != tail);
}

void deleteFromBeginning() {
    if (head == NULL) {
        cout << "Playlist is empty\\n";
        return;
    }

    Song* temp = head;

    if (head->next == head) {
        head = NULL;
    } else {
        Song* tail = head->prev;
        head = head->next;

        head->prev = tail;
        tail->next = head;
    }

    delete temp;
    cout << "Song deleted from beginning\\n";
}

void deleteFromEnd() {
    if (head == NULL) {
        cout << "Playlist is empty\\n";
        return;
    }

    Song* tail = head->prev;

    if (head->next == head) {
        head = NULL;
    } else {
        Song* newTail = tail->prev;

        newTail->next = head;
        head->prev = newTail;
    }

    delete tail;
    cout << "Song deleted from end\\n";
}

int main() {
    int choice, duration;
    string title, artist;

    do {
        cout << "\\n--- MUSIC PLAYLIST ---\\n";
        cout << "1. Insert at Beginning\\n";
        cout << "2. Insert at End\\n";
        cout << "3. Search by Title\\n";
        cout << "4. Display Forward\\n";
        cout << "5. Display Backward\\n";
        cout << "6. Delete from Beginning\\n";
        cout << "7. Delete from End\\n";
        cout << "8. Exit\\n";

        cout << "Enter choice: ";
        cin >> choice;

        switch (choice) {
            case 1:
            case 2:
                cout << "Enter song title: ";
                cin.ignore();
                getline(cin, title);

                cout << "Enter artist name: ";
                getline(cin, artist);

                cout << "Enter duration: ";
                cin >> duration;

                if (choice == 1)
                    insertAtBeginning(title, artist, duration);
                else
                    insertAtEnd(title, artist, duration);
                break;

            case 3:
                cout << "Enter title to search: ";
                cin.ignore();
                getline(cin, title);
                searchTitle(title);
                break;

            case 4:
                displayForward();
                break;

            case 5:
                displayBackward();
                break;

            case 6:
                deleteFromBeginning();
                break;

            case 7:
                deleteFromEnd();
                break;

            case 8:
                cout << "Exiting...\\n";
                break;

            default:
                cout << "Invalid choice\\n";
        }

    } while (choice != 8);

    return 0;
}
`,
        "Insert at either end, search by title, display both ways, and delete from either end.",
      ),
    ],
  },
  {
    number: "5",
    title: "Expression Conversion and Stack Implementation",
    summary: "Infix to postfix, postfix evaluation, and a stack built with a linked list.",
    programs: [
      program(
        "Infix to Postfix Conversion",
        `
#include <iostream>
#include <string>
using namespace std;

class Stack {
    char arr[100];
    int top;

public:
    Stack() {
        top = -1;
    }

    void push(char x) {
        arr[++top] = x;
    }

    char pop() {
        return arr[top--];
    }

    char peek() {
        return arr[top];
    }

    bool isEmpty() {
        return top == -1;
    }
};

int precedence(char op) {
    if (op == '^')
        return 3;
    else if (op == '*' || op == '/')
        return 2;
    else if (op == '+' || op == '-')
        return 1;

    return 0;
}

string infixToPostfix(string infix) {
    Stack s;
    string postfix = "";

    for (int i = 0; i < infix.length(); i++) {
        char ch = infix[i];

        if ((ch >= 'A' && ch <= 'Z') ||
            (ch >= 'a' && ch <= 'z') ||
            (ch >= '0' && ch <= '9')) {
            postfix += ch;
        }
        else if (ch == '(') {
            s.push(ch);
        }
        else if (ch == ')') {
            while (!s.isEmpty() && s.peek() != '(')
                postfix += s.pop();

            if (!s.isEmpty())
                s.pop();
        }
        else {
            while (!s.isEmpty() && s.peek() != '(' &&
                   precedence(s.peek()) >= precedence(ch)) {
                postfix += s.pop();
            }

            s.push(ch);
        }
    }

    while (!s.isEmpty())
        postfix += s.pop();

    return postfix;
}

int main() {
    string infix;

    cout << "Enter infix expression: ";
    cin >> infix;

    cout << "Postfix expression: "
         << infixToPostfix(infix);

    return 0;
}
`,
      ),
      program(
        "Postfix Evaluation",
        `
#include <iostream>
#include <string>
using namespace std;

class Stack {
    int arr[100];
    int top;

public:
    Stack() {
        top = -1;
    }

    void push(int x) {
        arr[++top] = x;
    }

    int pop() {
        return arr[top--];
    }

    bool isEmpty() {
        return top == -1;
    }
};

int calculate(int a, int b, char op) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
        default: return 0;
    }
}

int evaluatePostfix(string postfix) {
    Stack s;

    for (int i = 0; i < postfix.length(); i++) {
        char ch = postfix[i];

        if (ch >= '0' && ch <= '9') {
            s.push(ch - '0');
        } else {
            int b = s.pop();
            int a = s.pop();

            s.push(calculate(a, b, ch));
        }
    }

    return s.pop();
}

int main() {
    string postfix;

    cout << "Enter postfix expression: ";
    cin >> postfix;

    cout << "Result: " << evaluatePostfix(postfix);

    return 0;
}
`,
        "Evaluates single-digit operands.",
      ),
      program(
        "Stack Using Linked List",
        `
#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
};

class Stack {
    Node* top;

public:
    Stack() {
        top = NULL;
    }

    void push(int value) {
        Node* newNode = new Node;

        newNode->data = value;
        newNode->next = top;
        top = newNode;

        cout << value << " pushed into stack\\n";
    }

    void pop() {
        if (top == NULL) {
            cout << "Stack Underflow\\n";
            return;
        }

        Node* temp = top;

        cout << temp->data << " popped from stack\\n";

        top = top->next;
        delete temp;
    }

    void peek() {
        if (top == NULL) {
            cout << "Stack is empty\\n";
            return;
        }

        cout << "Top element: " << top->data << endl;
    }

    void display() {
        if (top == NULL) {
            cout << "Stack is empty\\n";
            return;
        }

        Node* temp = top;

        while (temp != NULL) {
            cout << temp->data << " ";
            temp = temp->next;
        }

        cout << endl;
    }
};

int main() {
    Stack s;
    int choice, value;

    do {
        cout << "\\n1. Push\\n";
        cout << "2. Pop\\n";
        cout << "3. Peek\\n";
        cout << "4. Display\\n";
        cout << "5. Exit\\n";

        cout << "Enter choice: ";
        cin >> choice;

        switch (choice) {
            case 1:
                cout << "Enter value: ";
                cin >> value;
                s.push(value);
                break;

            case 2:
                s.pop();
                break;

            case 3:
                s.peek();
                break;

            case 4:
                s.display();
                break;

            case 5:
                cout << "Exiting...\\n";
                break;

            default:
                cout << "Invalid choice\\n";
        }

    } while (choice != 5);

    return 0;
}
`,
      ),
    ],
  },
  {
    number: "6",
    title: "Circular Queue: Service Request Management",
    summary: "Enqueue, dequeue, display, and peek.",
    programs: [
      program(
        "Service Request Management",
        `
#include <iostream>
#include <string>
using namespace std;

const int SIZE = 5;

struct ServiceRequest {
    int requestID;
    string customerName;
    string serviceType;
};

class CircularQueue {
    ServiceRequest queue[SIZE];
    int front, rear, count;

public:
    CircularQueue() {
        front = 0;
        rear = -1;
        count = 0;
    }

    bool isFull() {
        return count == SIZE;
    }

    bool isEmpty() {
        return count == 0;
    }

    void enqueue(int id, string name, string type) {
        if (isFull()) {
            cout << "Queue is full\\n";
            return;
        }

        rear = (rear + 1) % SIZE;

        queue[rear].requestID = id;
        queue[rear].customerName = name;
        queue[rear].serviceType = type;

        count++;

        cout << "Request added successfully\\n";
    }

    void dequeue() {
        if (isEmpty()) {
            cout << "Queue is empty\\n";
            return;
        }

        cout << "Resolved Request ID: "
             << queue[front].requestID << endl;

        cout << "Customer: "
             << queue[front].customerName << endl;

        front = (front + 1) % SIZE;
        count--;
    }

    void display() {
        if (isEmpty()) {
            cout << "Queue is empty\\n";
            return;
        }

        int i = front;

        for (int j = 0; j < count; j++) {
            cout << "\\nRequest ID: " << queue[i].requestID;
            cout << "\\nCustomer: " << queue[i].customerName;
            cout << "\\nService: " << queue[i].serviceType << endl;

            i = (i + 1) % SIZE;
        }
    }

    void peek() {
        if (isEmpty()) {
            cout << "Queue is empty\\n";
            return;
        }

        cout << "Next Request ID: "
             << queue[front].requestID << endl;

        cout << "Customer: "
             << queue[front].customerName << endl;

        cout << "Service: "
             << queue[front].serviceType << endl;
    }
};

int main() {
    CircularQueue cq;
    int choice, id;
    string name, type;

    do {
        cout << "\\n--- SERVICE REQUEST MANAGEMENT ---\\n";
        cout << "1. Enqueue (Add Request)\\n";
        cout << "2. Dequeue (Resolve Request)\\n";
        cout << "3. Display Queue\\n";
        cout << "4. Peek (Next Request)\\n";
        cout << "5. Exit\\n";

        cout << "Enter choice: ";
        cin >> choice;

        switch (choice) {
            case 1:
                cout << "Enter Request ID: ";
                cin >> id;

                cout << "Enter Customer Name: ";
                cin >> name;

                cout << "Enter Service Type: ";
                cin >> type;

                cq.enqueue(id, name, type);
                break;

            case 2:
                cq.dequeue();
                break;

            case 3:
                cq.display();
                break;

            case 4:
                cq.peek();
                break;

            case 5:
                cout << "Exiting...\\n";
                break;

            default:
                cout << "Invalid choice\\n";
        }

    } while (choice != 5);

    return 0;
}
`,
      ),
    ],
  },
  {
    number: "7",
    title: "Deque: Shopping Mall Queue Management",
    summary:
      "Input-restricted deque: insert only at the rear, delete at both ends. Output-restricted deque: insert at both ends, delete only at the front.",
    programs: [
      program(
        "Shopping Mall Queue Management",
        `
#include <iostream>
using namespace std;

#define SIZE 5

class Deque {
    int arr[SIZE];
    int front, rear, count;

public:
    Deque() {
        front = -1;
        rear = -1;
        count = 0;
    }

    bool isFull() {
        return count == SIZE;
    }

    bool isEmpty() {
        return count == 0;
    }

    void insertFront(int value) {
        if (isFull()) {
            cout << "Deque is full\\n";
            return;
        }

        if (isEmpty())
            front = rear = 0;
        else
            front = (front - 1 + SIZE) % SIZE;

        arr[front] = value;
        count++;

        cout << "Inserted at front successfully\\n";
    }

    void insertRear(int value) {
        if (isFull()) {
            cout << "Deque is full\\n";
            return;
        }

        if (isEmpty())
            front = rear = 0;
        else
            rear = (rear + 1) % SIZE;

        arr[rear] = value;
        count++;

        cout << "Inserted at rear successfully\\n";
    }

    void deleteFront() {
        if (isEmpty()) {
            cout << "Deque is empty\\n";
            return;
        }

        cout << "Deleted customer ID: " << arr[front] << endl;

        if (front == rear)
            front = rear = -1;
        else
            front = (front + 1) % SIZE;

        count--;
    }

    void deleteRear() {
        if (isEmpty()) {
            cout << "Deque is empty\\n";
            return;
        }

        cout << "Deleted customer ID: " << arr[rear] << endl;

        if (front == rear)
            front = rear = -1;
        else
            rear = (rear - 1 + SIZE) % SIZE;

        count--;
    }

    void display() {
        if (isEmpty()) {
            cout << "Deque is empty\\n";
            return;
        }

        cout << "Shopping Mall Queue: ";

        int i = front;

        for (int j = 0; j < count; j++) {
            cout << arr[i] << " ";
            i = (i + 1) % SIZE;
        }

        cout << endl;
    }
};

int main() {
    Deque dq;
    int scenario, choice, value;

    cout << "--- SHOPPING MALL DEQUE MANAGEMENT ---\\n";
    cout << "1. Input Restricted Deque\\n";
    cout << "2. Output Restricted Deque\\n";
    cout << "Choose scenario: ";
    cin >> scenario;

    if (scenario != 1 && scenario != 2) {
        cout << "Invalid scenario\\n";
        return 0;
    }

    do {
        cout << "\\n--- MENU ---\\n";
        cout << "1. Insert Front\\n";
        cout << "2. Insert Rear\\n";
        cout << "3. Delete Front\\n";
        cout << "4. Delete Rear\\n";
        cout << "5. Display Queue\\n";
        cout << "6. Exit\\n";

        cout << "Enter choice: ";
        cin >> choice;

        switch (choice) {
            case 1:
                if (scenario == 1) {
                    cout << "Insertion allowed only at rear "
                         << "in Input Restricted Deque\\n";
                } else {
                    cout << "Enter customer ID: ";
                    cin >> value;
                    dq.insertFront(value);
                }
                break;

            case 2:
                cout << "Enter customer ID: ";
                cin >> value;
                dq.insertRear(value);
                break;

            case 3:
                dq.deleteFront();
                break;

            case 4:
                if (scenario == 2) {
                    cout << "Deletion allowed only at front "
                         << "in Output Restricted Deque\\n";
                } else {
                    dq.deleteRear();
                }
                break;

            case 5:
                dq.display();
                break;

            case 6:
                cout << "Exiting...\\n";
                break;

            default:
                cout << "Invalid choice\\n";
        }

    } while (choice != 6);

    return 0;
}
`,
      ),
    ],
  },
  {
    number: "8",
    title: "Student Record Management Using Binary Search Tree",
    summary:
      "Insert, minimum, maximum, search, predecessor, successor, delete, and inorder, preorder, and postorder traversal.",
    programs: [
      program(
        "Student Record Management",
        `
#include <iostream>
#include <string>
using namespace std;

struct Student {
    int rollNo;
    string name, course;
    Student* left;
    Student* right;
};

Student* createNode(int rollNo, string name, string course) {
    Student* newNode = new Student;

    newNode->rollNo = rollNo;
    newNode->name = name;
    newNode->course = course;

    newNode->left = NULL;
    newNode->right = NULL;

    return newNode;
}

Student* insert(Student* root, int rollNo,
                string name, string course) {
    if (root == NULL)
        return createNode(rollNo, name, course);

    if (rollNo < root->rollNo)
        root->left = insert(root->left, rollNo, name, course);
    else if (rollNo > root->rollNo)
        root->right = insert(root->right, rollNo, name, course);
    else
        cout << "Duplicate Roll Number\\n";

    return root;
}

Student* findMin(Student* root) {
    if (root == NULL)
        return NULL;

    while (root->left != NULL)
        root = root->left;

    return root;
}

Student* findMax(Student* root) {
    if (root == NULL)
        return NULL;

    while (root->right != NULL)
        root = root->right;

    return root;
}

Student* search(Student* root, int rollNo) {
    if (root == NULL || root->rollNo == rollNo)
        return root;

    if (rollNo < root->rollNo)
        return search(root->left, rollNo);

    return search(root->right, rollNo);
}

Student* predecessor(Student* root, int rollNo) {
    Student* curr = search(root, rollNo);

    if (curr == NULL)
        return NULL;

    if (curr->left != NULL)
        return findMax(curr->left);

    Student* pred = NULL;

    while (root != NULL) {
        if (rollNo > root->rollNo) {
            pred = root;
            root = root->right;
        } else if (rollNo < root->rollNo) {
            root = root->left;
        } else {
            break;
        }
    }

    return pred;
}

Student* successor(Student* root, int rollNo) {
    Student* curr = search(root, rollNo);

    if (curr == NULL)
        return NULL;

    if (curr->right != NULL)
        return findMin(curr->right);

    Student* succ = NULL;

    while (root != NULL) {
        if (rollNo < root->rollNo) {
            succ = root;
            root = root->left;
        } else if (rollNo > root->rollNo) {
            root = root->right;
        } else {
            break;
        }
    }

    return succ;
}

Student* deleteRecord(Student* root, int rollNo) {
    if (root == NULL)
        return NULL;

    if (rollNo < root->rollNo) {
        root->left = deleteRecord(root->left, rollNo);
    }
    else if (rollNo > root->rollNo) {
        root->right = deleteRecord(root->right, rollNo);
    }
    else {
        if (root->left == NULL) {
            Student* temp = root->right;
            delete root;
            return temp;
        }

        if (root->right == NULL) {
            Student* temp = root->left;
            delete root;
            return temp;
        }

        Student* temp = findMin(root->right);

        root->rollNo = temp->rollNo;
        root->name = temp->name;
        root->course = temp->course;

        root->right = deleteRecord(root->right, temp->rollNo);
    }

    return root;
}

void displayStudent(Student* s) {
    if (s != NULL) {
        cout << "\\nRoll No: " << s->rollNo;
        cout << "\\nName: " << s->name;
        cout << "\\nCourse: " << s->course << endl;
    }
}

void inorder(Student* root) {
    if (root != NULL) {
        inorder(root->left);
        displayStudent(root);
        inorder(root->right);
    }
}

void preorder(Student* root) {
    if (root != NULL) {
        displayStudent(root);
        preorder(root->left);
        preorder(root->right);
    }
}

void postorder(Student* root) {
    if (root != NULL) {
        postorder(root->left);
        postorder(root->right);
        displayStudent(root);
    }
}

int main() {
    Student* root = NULL;

    int choice, rollNo;
    string name, course;

    do {
        cout << "\\n--- STUDENT RECORD MANAGEMENT ---\\n";
        cout << "1. Insert Record\\n";
        cout << "2. Find Minimum Roll Number\\n";
        cout << "3. Find Maximum Roll Number\\n";
        cout << "4. Search Student\\n";
        cout << "5. Find Predecessor\\n";
        cout << "6. Find Successor\\n";
        cout << "7. Delete Record\\n";
        cout << "8. Display BST Traversals\\n";
        cout << "9. Exit\\n";

        cout << "Enter choice: ";
        cin >> choice;

        switch (choice) {
            case 1:
                cout << "Enter Roll No: ";
                cin >> rollNo;

                cout << "Enter Name: ";
                getline(cin >> ws, name);

                cout << "Enter Course: ";
                getline(cin, course);

                root = insert(root, rollNo, name, course);
                break;

            case 2:
                displayStudent(findMin(root));
                break;

            case 3:
                displayStudent(findMax(root));
                break;

            case 4:
                cout << "Enter Roll No to search: ";
                cin >> rollNo;
                displayStudent(search(root, rollNo));
                break;

            case 5:
                cout << "Enter Roll No: ";
                cin >> rollNo;
                displayStudent(predecessor(root, rollNo));
                break;

            case 6:
                cout << "Enter Roll No: ";
                cin >> rollNo;
                displayStudent(successor(root, rollNo));
                break;

            case 7:
                cout << "Enter Roll No to delete: ";
                cin >> rollNo;
                root = deleteRecord(root, rollNo);
                cout << "Delete operation completed\\n";
                break;

            case 8:
                cout << "\\nInorder Traversal:\\n";
                inorder(root);

                cout << "\\nPreorder Traversal:\\n";
                preorder(root);

                cout << "\\nPostorder Traversal:\\n";
                postorder(root);
                break;

            case 9:
                cout << "Exiting...\\n";
                break;

            default:
                cout << "Invalid choice\\n";
        }

    } while (choice != 9);

    return 0;
}
`,
      ),
    ],
  },
  {
    number: "9",
    title: "Graph Traversal System for Delivery Routes",
    summary: "Add locations and roads, then walk the graph with BFS and DFS.",
    note: "BFS finds a shortest path by number of edges when every road has the same weight. DFS follows one path to the end before it backtracks. Each road is stored in both directions.",
    programs: [
      program(
        "Delivery Route Management",
        `
#include <iostream>
#include <vector>
#include <queue>
#include <string>
using namespace std;

class Graph {
    vector<string> locations;
    vector<vector<int>> adj;
    int vertices;

public:
    Graph() {
        vertices = 0;
    }

    void addLocation() {
        string name;

        cout << "Enter location name: ";
        cin >> name;

        locations.push_back(name);
        adj.push_back(vector<int>());

        vertices++;

        cout << "Location added successfully\\n";
    }

    void displayLocations() {
        cout << "\\nAvailable Locations:\\n";

        for (int i = 0; i < vertices; i++)
            cout << i << " - " << locations[i] << endl;
    }

    void addRoad() {
        if (vertices < 2) {
            cout << "Add at least two locations first\\n";
            return;
        }

        displayLocations();

        int source, destination;

        cout << "Enter source location number: ";
        cin >> source;

        cout << "Enter destination location number: ";
        cin >> destination;

        if (source < 0 || destination < 0 ||
            source >= vertices || destination >= vertices) {
            cout << "Invalid location number\\n";
            return;
        }

        adj[source].push_back(destination);
        adj[destination].push_back(source);

        cout << "Road added successfully\\n";
    }

    void BFS(int source, int destination) {
        if (source < 0 || destination < 0 ||
            source >= vertices || destination >= vertices) {
            cout << "Invalid location number\\n";
            return;
        }

        vector<bool> visited(vertices, false);
        vector<int> parent(vertices, -1);

        queue<int> q;

        visited[source] = true;
        q.push(source);

        while (!q.empty()) {
            int current = q.front();
            q.pop();

            if (current == destination)
                break;

            for (int neighbor : adj[current]) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    parent[neighbor] = current;
                    q.push(neighbor);
                }
            }
        }

        if (!visited[destination]) {
            cout << "No route available between these locations\\n";
            return;
        }

        vector<int> path;

        for (int current = destination;
             current != -1;
             current = parent[current]) {
            path.push_back(current);
        }

        cout << "Shortest Route using BFS:\\n";

        for (int i = path.size() - 1; i >= 0; i--) {
            cout << locations[path[i]];

            if (i != 0)
                cout << " -> ";
        }

        cout << endl;
    }

    void DFSUtil(int source, vector<bool>& visited) {
        visited[source] = true;

        cout << locations[source] << " -> ";

        for (int neighbor : adj[source]) {
            if (!visited[neighbor])
                DFSUtil(neighbor, visited);
        }
    }

    void DFS(int source) {
        if (source < 0 || source >= vertices) {
            cout << "Invalid location number\\n";
            return;
        }

        vector<bool> visited(vertices, false);

        cout << "DFS Traversal Order:\\n";
        DFSUtil(source, visited);

        cout << "END\\n";
    }
};

int main() {
    Graph g;
    int choice, source, destination;

    do {
        cout << "\\n--- DELIVERY ROUTE MANAGEMENT SYSTEM ---\\n";
        cout << "1. Add Delivery Location\\n";
        cout << "2. Add Road Between Locations\\n";
        cout << "3. Display All Locations\\n";
        cout << "4. BFS - Find Shortest Route\\n";
        cout << "5. DFS - Explore Delivery Routes\\n";
        cout << "6. Exit\\n";

        cout << "Enter choice: ";
        cin >> choice;

        switch (choice) {
            case 1:
                g.addLocation();
                break;

            case 2:
                g.addRoad();
                break;

            case 3:
                g.displayLocations();
                break;

            case 4:
                g.displayLocations();

                cout << "Enter warehouse location number: ";
                cin >> source;

                cout << "Enter delivery destination number: ";
                cin >> destination;

                g.BFS(source, destination);
                break;

            case 5:
                g.displayLocations();

                cout << "Enter warehouse location number: ";
                cin >> source;

                g.DFS(source);
                break;

            case 6:
                cout << "Exiting...\\n";
                break;

            default:
                cout << "Invalid choice\\n";
        }

    } while (choice != 6);

    return 0;
}
`,
      ),
    ],
  },
  {
    number: "A",
    title: "Additional Programs",
    summary: "Three extra programs from the uploaded files.",
    programs: [
      program(
        "Retail Store Inventory Management",
        `
#include <iostream>
#include <string>
using namespace std;

struct Item {
    int id;
    string name;
    int quantity;
    int price;
};

int main() {
    const int SIZE = 10;
    Item table[SIZE];

    for (int i = 0; i < SIZE; i++)
        table[i].id = -1;

    int choice;

    do {
        cout << "\\n--- RETAIL STORE INVENTORY MANAGEMENT ---\\n";
        cout << "1. Add Item\\n";
        cout << "2. Display Items\\n";
        cout << "3. Exit\\n";

        cout << "Enter choice: ";
        cin >> choice;

        if (choice == 1) {
            Item item;

            cout << "Enter item ID: ";
            cin >> item.id;

            cout << "Enter item name: ";
            cin >> item.name;

            cout << "Enter item quantity: ";
            cin >> item.quantity;

            cout << "Enter item price: ";
            cin >> item.price;

            int index = item.id % SIZE;
            int i = 0;

            while (i < SIZE &&
                   table[(index + i * i) % SIZE].id != -1) {
                i++;
            }

            if (i == SIZE) {
                cout << "Inventory table is full\\n";
            } else {
                table[(index + i * i) % SIZE] = item;
                cout << "Item added successfully!\\n";
            }
        }

        else if (choice == 2) {
            cout << "\\nItems in the store:\\n";

            for (int i = 0; i < SIZE; i++) {
                if (table[i].id != -1) {
                    cout << "\\nItem ID: " << table[i].id;
                    cout << "\\nItem Name: " << table[i].name;
                    cout << "\\nQuantity: " << table[i].quantity;
                    cout << "\\nPrice: " << table[i].price << endl;
                }
            }
        }

        else if (choice == 3) {
            cout << "Exiting...\\n";
        }

        else {
            cout << "Invalid choice\\n";
        }

    } while (choice != 3);

    return 0;
}
`,
        "Hashing with quadratic probing. Add an item, display items, or exit.",
      ),
      program(
        "Student Marks Analysis System",
        `
#include <iostream>
#include <string>
using namespace std;

int main() {
    string name;
    int sub1, sub2, sub3, sub4, sub5;
    int total;
    float average;

    cout << "STUDENT MARKS ANALYSIS\\n";

    cout << "Enter student's name: ";
    cin >> name;

    cout << "Enter marks of 5 subjects:\\n";

    cin >> sub1 >> sub2 >> sub3 >> sub4 >> sub5;

    total = sub1 + sub2 + sub3 + sub4 + sub5;

    average = total / 5.0;

    cout << "\\n--- STUDENT ANALYSIS ---\\n";

    cout << "Name: " << name << endl;
    cout << "Total Marks: " << total << "/500" << endl;
    cout << "Average: " << average << endl;

    if (average >= 40) {
        cout << "Result: PASS\\n";
    } else {
        cout << "Result: FAIL\\n";
    }

    return 0;
}
`,
        "Reads five subject marks, then prints the total, average, and pass or fail.",
      ),
      program(
        "Sentinel Search",
        `
#include <iostream>
#include <string>
using namespace std;

struct Product {
    int id;
    string name;
    int quantity;
};

int main() {
    Product p[100];
    int n, choice, key;

    cout << "Enter number of products: ";
    cin >> n;

    if (n < 1 || n > 100) {
        cout << "Invalid number of products";
        return 0;
    }

    for (int i = 0; i < n; i++) {
        cout << "\\nEnter Product ID: ";
        cin >> p[i].id;

        cout << "Enter Product Name: ";
        cin >> p[i].name;

        cout << "Enter Quantity: ";
        cin >> p[i].quantity;
    }

    do {
        cout << "\\n\\n--- WAREHOUSE MANAGEMENT SYSTEM ---\\n";
        cout << "1. Add Product\\n";
        cout << "2. Display Products\\n";
        cout << "3. Search Product using Sentinel Search\\n";
        cout << "4. Exit\\n";

        cout << "Enter choice: ";
        cin >> choice;

        switch (choice) {

            case 1:
                if (n == 100) {
                    cout << "Warehouse is full\\n";
                    break;
                }

                cout << "Enter Product ID: ";
                cin >> p[n].id;

                cout << "Enter Product Name: ";
                cin >> p[n].name;

                cout << "Enter Quantity: ";
                cin >> p[n].quantity;

                n++;
                cout << "Product added successfully\\n";
                break;

            case 2:
                cout << "\\nProduct Records:\\n";

                for (int i = 0; i < n; i++) {
                    cout << "\\nID: " << p[i].id;
                    cout << "\\nName: " << p[i].name;
                    cout << "\\nQuantity: " << p[i].quantity << endl;
                }
                break;

            case 3: {
                cout << "Enter Product ID to search: ";
                cin >> key;

                int last = p[n - 1].id;

                p[n - 1].id = key;

                int i = 0;

                while (p[i].id != key) {
                    i++;
                }

                p[n - 1].id = last;

                if (i < n - 1 || last == key) {
                    cout << "\\nProduct Found!";
                    cout << "\\nProduct ID: " << p[i].id;
                    cout << "\\nProduct Name: " << p[i].name;
                    cout << "\\nQuantity: " << p[i].quantity << endl;
                }
                else {
                    cout << "Product not found\\n";
                }

                break;
            }

            case 4:
                cout << "Exiting Warehouse System...\\n";
                break;

            default:
                cout << "Invalid choice\\n";
        }

    } while (choice != 4);

    return 0;
}
`,
        "Warehouse stock: add a product, display the list, and search by id with sentinel search.",
      ),
    ],
  },
];
