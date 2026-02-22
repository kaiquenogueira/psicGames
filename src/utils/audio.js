export const playSound = (frequency, type = 'sine', duration = 0.5, volume = 0.3) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration)
}

// Sucesso - Tom agudo e suave
export const playSuccess = () => {
    playSound(523.25, 'sine', 0.2, 0.2) // C5
    setTimeout(() => playSound(659.25, 'sine', 0.3, 0.2), 100) // E5
}

// Erro - Tom grave e áspero
export const playError = () => {
    playSound(150, 'sawtooth', 0.3, 0.3)
}

// Tick - Marcação de tempo/neutro
export const playTick = () => {
    playSound(400, 'triangle', 0.1, 0.1)
}
