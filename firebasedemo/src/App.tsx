import React, { useState } from 'react';
import { db, collection, addDoc } from './firebase';

const App: React.FC = () => {
  const [message, setMessage] = useState('');

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
      } catch (error) {
        console.error('Error adding document: ', error);
      }
    }
  };

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
    </div>
  );
};

export default App;