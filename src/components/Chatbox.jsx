import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { getUserFromToken } from '../utils/auth';

const socket = io('http://localhost:5000'); // or your deployed URL

const ChatBox = ({ bookingId, plumberId, residentId }) => {
  const user = getUserFromToken();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef();

  useEffect(() => {
    // Join a room specific to the booking
    if (bookingId) {
      socket.emit('joinRoom', bookingId);
    }

    // Listen for incoming messages
    socket.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [bookingId]);

  const sendMessage = () => {
    if (!message.trim()) return;
    const msgData = {
      bookingId,
      senderId: user.id,
      senderRole: user.role,
      message,
      timestamp: new Date(),
    };

    socket.emit('sendMessage', msgData);
    setMessages((prev) => [...prev, msgData]);
    setMessage('');
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="mt-6 p-4 border rounded bg-white shadow">
      <h4 className="font-semibold text-lg mb-2">Chat</h4>
      <div className="h-60 overflow-y-auto border p-2 rounded mb-3 bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded ${
              msg.senderId === user.id ? 'bg-blue-100 text-right' : 'bg-gray-200 text-left'
            }`}
          >
            <p className="text-sm">{msg.message}</p>
            <p className="text-xs text-gray-500">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded p-2"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
