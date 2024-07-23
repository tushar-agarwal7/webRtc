import { useEffect, useState } from "react";

const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');
    socket.onopen = () => {
      setSocket(socket);
      socket.send(JSON.stringify({ type: 'sender' }));
    };

    socket.onclose = () => {
      if (pc) {
        pc.close();
      }
      setSocket(null);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setSocket(socket);

    return () => {
      if (socket) {
        socket.close();
      }
      if (pc) {
        pc.close();
      }
    };
  }, []);

  async function startVideo() {
    if (!socket) {
      alert("Socket not found");
      return;
    }

    const pc = new RTCPeerConnection();
    setPc(pc);

    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.send(JSON.stringify({ type: 'createOffer', sdp: pc.localDescription }));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(JSON.stringify({ type: 'iceCandidate', candidate: event.candidate }));
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'createAnswer') {
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      } else if (data.type === 'iceCandidate') {
        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    const video = document.createElement('video');
    document.body.appendChild(video);
    video.srcObject = stream;
    video.play();
  }

  return (
    <div>
      <button onClick={startVideo}>Send Video</button>
    </div>
  );
};

export default Sender;
