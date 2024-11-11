let APP_ID = "29e0a12f57cd41a19033910c6599982c";
let token = null;
let uid = String(Math.floor(Math.random() * 10000));
let client;
let channel;

let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let roomId = urlParams.get('roomId');

if (!roomId) {
    console.error("No se encontró el roomId en la URL.");
    window.location = 'chat.html';
}

let localStream;
let remoteStream;
let peerConnection;

const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
};

let init = async () => {
    client = await AgoraRTM.createInstance(APP_ID);
    await client.login({ uid, token });

    channel = client.createChannel(roomId);
    await channel.join();

    channel.on('MemberJoined', handleUserJoined);
    channel.on('MemberLeft', handleUserLeft);
    client.on('MessageFromPeer', handleMessageFromPeer);

    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById('local-video').srcObject = localStream;
    } catch (error) {
        console.error("Error al acceder a la cámara o micrófono:", error);
        return;
    }
};

let handleUserLeft = (memberId) => {
    document.getElementById('remote-video').style.display = 'none';
};

let handleMessageFromPeer = async (message, memberId) => {
    message = JSON.parse(message.text);

    if (message.type === 'offer') {
        createAnswer(memberId, message.offer);
    } else if (message.type === 'answer') {
        addAnswer(message.answer);
    } else if (message.type === 'candidate' && peerConnection.remoteDescription) {
        peerConnection.addIceCandidate(message.candidate).catch(error => console.error("Error al agregar ICE Candidate:", error));
    } else {
        console.warn("La descripción remota no está configurada. Ignorando candidato ICE.");
    }
};

let handleUserJoined = async (memberId) => {
    console.log('A new user joined the channel:', memberId);
    createOffer(memberId);
};

let createPeerConnection = async (memberId) => {
    peerConnection = new RTCPeerConnection(servers);

    remoteStream = new MediaStream();
    document.getElementById('remote-video').srcObject = remoteStream;
    document.getElementById('remote-video').style.display = 'block';

    if (localStream) {
        localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream);
        });
    } else {
        console.error("localStream no está definido.");
    }

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
        });
    };

    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'candidate', 'candidate': event.candidate }) }, memberId);
        }
    };
};

let createOffer = async (memberId) => {
    await createPeerConnection(memberId);
    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'offer', 'offer': offer }) }, memberId);
};

let createAnswer = async (memberId, offer) => {
    await createPeerConnection(memberId);
    await peerConnection.setRemoteDescription(offer);

    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'answer', 'answer': answer }) }, memberId);
};

let addAnswer = async (answer) => {
    if (!peerConnection.currentRemoteDescription) {
        await peerConnection.setRemoteDescription(answer);
    }
};

let leaveChannel = async () => {
    await channel.leave();
    await client.logout();
};

let toggleCamera = async () => {
    let videoTrack = localStream.getTracks().find(track => track.kind === 'video');
    videoTrack.enabled = !videoTrack.enabled;
    document.getElementById('camera-btn').style.backgroundColor = videoTrack.enabled ? 'rgb(179, 102, 249, .9)' : 'rgb(255, 80, 80)';
};

let toggleMic = async () => {
    let audioTrack = localStream.getTracks().find(track => track.kind === 'audio');
    audioTrack.enabled = !audioTrack.enabled;
    document.getElementById('mute-btn').style.backgroundColor = audioTrack.enabled ? 'rgb(179, 102, 249, .9)' : 'rgb(255, 80, 80)';
};

window.addEventListener('beforeunload', leaveChannel);
document.getElementById('camera-btn').addEventListener('click', toggleCamera);
document.getElementById('mute-btn').addEventListener('click', toggleMic);

init();
