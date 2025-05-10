/*
MIT License

Copyright (c) 2025 Clove Twilight

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { useEffect, useRef, useCallback, useState } from 'react';

const useWebSocket = (onMessage, onError = null) => {
  const ws = useRef(null);
  const reconnectTimer = useRef(null);
  const reconnectAttempts = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 second

  const connect = useCallback(() => {
    try {
      // Determine the correct WebSocket URL based on current protocol
      let wsUrl;
      if (window.location.protocol === 'https:') {
        // For HTTPS, use WSS and the same domain
        wsUrl = `wss://${window.location.host}/ws`;
      } else {
        // For HTTP (local development), use WS
        wsUrl = `ws://${window.location.host}/ws`;
      }
      
      console.log('Attempting to connect to WebSocket:', wsUrl);
      
      // Clean up any existing connection
      if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
        ws.current.close();
      }
      
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        // Send a ping to keep the connection alive
        const pingInterval = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send('ping');
          }
        }, 30000); // Ping every 30 seconds
        
        // Store the interval ID to clear it later
        ws.current._pingInterval = pingInterval;
      };
      
      ws.current.onmessage = (event) => {
        try {
          // Handle pong responses
          if (event.data === 'pong') {
            return; // Just acknowledge the pong, don't pass it to the handler
          }
          
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };
      
      ws.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        
        // Clear ping interval
        if (ws.current?._pingInterval) {
          clearInterval(ws.current._pingInterval);
        }
        
        // Attempt to reconnect if not intentionally closed
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts.current);
          console.log(`Attempting to reconnect in ${delay}ms... (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimer.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
          if (onError) {
            onError(new Error('Failed to reconnect to WebSocket'));
          }
        }
      };
      
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        
        // For connection errors, let the close handler deal with reconnection
        // Don't call onError here as it might cause duplicate error handling
      };
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setIsConnected(false);
      if (onError) {
        onError(error);
      }
    }
  }, [onMessage, onError]);

  useEffect(() => {
    connect();
    
    // Cleanup on unmount
    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      
      if (ws.current) {
        // Clear ping interval
        if (ws.current._pingInterval) {
          clearInterval(ws.current._pingInterval);
        }
        
        ws.current.close(1000, 'Component unmounting');
        ws.current = null;
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(message);
      return true;
    }
    return false;
  }, []);

  return {
    sendMessage,
    isConnected
  };
};

export default useWebSocket;