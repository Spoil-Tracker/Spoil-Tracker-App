import React, { useState, useEffect } from 'react';
import { db, collection, addDoc, getDocs } from './firebase';

const App: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]); // State to hold the fetched messages

  // Handle form submission to add message to Firestore
  const handleSubmit = async () => {
    if (message) {
      try {
        // Reference to Firestore collection
        const messagesCollection = collection(db, 'messages');

        // Add a new document with the message
        await addDoc(messagesCollection, {
          content: message,
          timestamp: new Date(),
        });

        alert('Message added successfully!');
        setMessage('');
        fetchMessages(); // Fetch the messages again after adding a new one
      } catch (error) {
        console.error('Error adding document: ', error);
      }
    }
  };

  // Fetch messages from Firestore
  const fetchMessages = async () => {
    try {
      const messagesCollection = collection(db, 'messages');
      const querySnapshot = await getDocs(messagesCollection);

      // Extract documents and store them in the state
      const loadedMessages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error fetching documents: ', error);
    }
  };

  // Fetch messages when the component mounts
  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="App">
      <h1>Write to Firestore</h1>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message"
      />
      <button onClick={handleSubmit}>Submit</button>
<h2>Messages</h2>
      <ul>
        {messages.map((msg) => (
          <li key={msg.id}>
            <strong>{msg.content}</strong> <br />
            <small>{new Date(msg.timestamp.seconds * 1000).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;