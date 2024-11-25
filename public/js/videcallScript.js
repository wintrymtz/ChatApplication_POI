let APP_ID = "29e0a12f57cd41a19033910c6599982c"

let token = null;
let uid = String(Math.floor(Math.random() * 10000))

let client;
let channel;

let queryString = window.location.search
let urlParams = new URLSearchParams(queryString)
let roomId = urlParams.get('roomId')
// let roomId = "1";

if (roomId == "1") {
    window.location = 'lobby.html'
}

let localStream;
let remoteStream;
let peerConnection;

const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.goolge.com:19302', 'stun:stun2.l.goolge.com:19302']
        }
    ]
}

let init = async () => {
    client = await AgoraRTM.createInstance(APP_ID);
    await client.login({ uid, token })

    //index.html?room=232323
    channel = client.createChannel(roomId);
    await channel.join();

    channel.on('MemberJoined', handlerUserJoined)
    channel.on('MemberLeft', handlerUserLeft);

    client.on('MessageFromPeer', handlerMessageFromPeer);

    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })

    //pista sin audio
    let streamWithoutAudio = new MediaStream();
    localStream.getVideoTracks().forEach(track => streamWithoutAudio.addTrack(track));

    document.getElementById('user-1').srcObject = streamWithoutAudio;
}
let handlerUserLeft = (MemberId) => {
    document.getElementById('user-2').style.display = 'none';
}

let handlerMessageFromPeer = async (message, MemberId) => {
    message = JSON.parse(message.text);
    // console.log('Message: ', message)
    if (message.type === 'offer') {
        createAnswer(MemberId, message.offer);
    }

    if (message.type === 'answer') {
        addAnswer(message.answer);
    }

    if (message.type === 'candidate') {
        if (peerConnection) {
            peerConnection.addIceCandidate(message.candidate);
        }
    }
}

let handlerUserJoined = async (memberId) => {
    console.log('A new user joined the channel: ', memberId)
    createOffer(memberId);
}

let createPeerConnection = async (MemberId) => {
    peerConnection = new RTCPeerConnection(servers)

    remoteStream = new MediaStream();
    document.getElementById('user-2').srcObject = remoteStream;
    document.getElementById('user-2').style.display = 'block';

    if (!localStream) {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })

        //pista sin audio
        let streamWithoutAudio = new MediaStream();
        localStream.getVideoTracks().forEach(track => streamWithoutAudio.addTrack(track));

        document.getElementById('user-1').srcObject = streamWithoutAudio;
    }
    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
        })
    }

    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'candidate', 'candidate': event.candidate }) }, MemberId);
            // console.log('New ICE candidate:', event.candidate)
        }
    }
}
let createOffer = async (MemberId) => {
    await createPeerConnection(MemberId);
    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'offer', 'offer': offer }) }, MemberId);
}

let createAnswer = async (MemberId, offer) => {
    await createPeerConnection(MemberId);

    await peerConnection.setRemoteDescription(offer);

    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'answer', 'answer': answer }) }, MemberId);
}

let addAnswer = async (answer) => {
    if (!peerConnection.currentRemoteDescription) {
        peerConnection.setRemoteDescription(answer);
    }
}

let leaveChannel = async () => {
    await channel.leave()
    await client.logout()
}

let toogleCamera = async () => {
    let videoTrack = localStream.getTracks().find(track => track.kind === 'video')

    if (videoTrack.enabled) {
        videoTrack.enabled = false;
        document.getElementById('camera-btn').style.backgroundColor = 'rgb(255, 80, 80)'
    } else {
        videoTrack.enabled = true;
        document.getElementById('camera-btn').style.backgroundColor = 'rgb(179, 102, 249, .9)'
    }
}

let toogleMic = async () => {
    let audioTrack = localStream.getTracks().find(track => track.kind === 'audio')

    if (audioTrack.enabled) {
        audioTrack.enabled = false;
        document.getElementById('mic-btn').style.backgroundColor = 'rgb(255, 80, 80)'
    } else {
        audioTrack.enabled = true;
        document.getElementById('mic-btn').style.backgroundColor = 'rgb(179, 102, 249, .9)'
    }
}

window.addEventListener('beforeunload', leaveChannel);
document.getElementById('camera-btn').addEventListener('click', toogleCamera)
document.getElementById('mic-btn').addEventListener('click', toogleMic)

init()