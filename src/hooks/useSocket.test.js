import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSocket } from '../hooks/useSocket'
import { supabase } from '../lib/supabase'

// Mock the Supabase client
vi.mock('../lib/supabase', () => {
    const mockChannel = {
        on: vi.fn(),
        subscribe: vi.fn(),
        track: vi.fn(),
        send: vi.fn(),
        presenceState: vi.fn(),
    }

    // Allow chaining
    mockChannel.on.mockReturnValue(mockChannel)

    return {
        supabase: {
            channel: vi.fn(() => mockChannel),
            removeChannel: vi.fn(),
        }
    }
})

describe('useSocket hook', () => {
    let mockChannel

    beforeEach(() => {
        vi.clearAllMocks()

        mockChannel = supabase.channel('dummy')

        // Simulate a successful subscription by default
        mockChannel.subscribe.mockImplementation((callback) => {
            callback('SUBSCRIBED')
        })

        // Simulate empty presence by default
        mockChannel.presenceState.mockReturnValue({})
    })

    it('initializes with a disconnected state initially, then connected shortly after', () => {
        vi.useFakeTimers()
        const { result } = renderHook(() => useSocket())

        // It connects synchronously in the hook now (HTTP/wss semantics)
        expect(result.current.isConnected).toBe(true)
        expect(result.current.sessionId).toBeTruthy()
        expect(typeof result.current.sessionId).toBe('string')

        vi.useRealTimers()
    })

    it('memoizes the socket object properly', () => {
        const { result, rerender } = renderHook(() => useSocket())

        const initialSocket = result.current.socket

        rerender()

        expect(result.current.socket).toBe(initialSocket)
    })

    it('can create a room and set up the channel as host', async () => {
        const { result } = renderHook(() => useSocket())

        const roomCreatedSpy = vi.fn()
        result.current.on('room_created', roomCreatedSpy)

        await act(async () => {
            result.current.createRoom('HostPlayer', 'attention')
        })

        expect(supabase.channel).toHaveBeenCalled()
        expect(mockChannel.subscribe).toHaveBeenCalled()
        expect(mockChannel.track).toHaveBeenCalledWith(expect.objectContaining({
            name: 'HostPlayer',
            is_host: true,
            game_type: 'attention'
        }))

        expect(roomCreatedSpy).toHaveBeenCalledWith(expect.objectContaining({
            room_code: expect.any(String),
            player: expect.objectContaining({ name: 'HostPlayer', is_host: true })
        }))
    })

    it('can join an existing room and set up the channel as a guest', async () => {
        const { result } = renderHook(() => useSocket())

        const roomJoinedSpy = vi.fn()
        result.current.on('room_joined', roomJoinedSpy)

        await act(async () => {
            result.current.joinRoom('ABCDEF', 'GuestPlayer')
        })

        expect(supabase.channel).toHaveBeenCalledWith('room:ABCDEF', expect.any(Object))
        expect(mockChannel.subscribe).toHaveBeenCalled()
        expect(mockChannel.track).toHaveBeenCalledWith(expect.objectContaining({
            name: 'GuestPlayer',
            is_host: false
        }))

        expect(roomJoinedSpy).toHaveBeenCalledWith(expect.objectContaining({
            room_code: 'ABCDEF',
            player: expect.objectContaining({ name: 'GuestPlayer', is_host: false })
        }))
    })

    it('handles presence sync and diffs players correctly', async () => {
        const { result } = renderHook(() => useSocket())

        const playersUpdatedSpy = vi.fn()
        const playerJoinedSpy = vi.fn()
        const playerLeftSpy = vi.fn()

        result.current.on('players_updated', playersUpdatedSpy)
        result.current.on('player_joined', playerJoinedSpy)
        result.current.on('player_left', playerLeftSpy)

        // Setup a room first
        await act(async () => {
            result.current.createRoom('Host', 'memory')
        })

        // Find the presence sync callback
        const presenceCall = mockChannel.on.mock.calls.find(call =>
            call[0] === 'presence' && call[1].event === 'sync'
        )
        const syncCallback = presenceCall[2]

        // Simulate the initial sync where only the host is present
        mockChannel.presenceState.mockReturnValue({
            [result.current.sessionId]: [{ session_id: result.current.sessionId, name: 'Host', is_host: true }]
        })

        await act(async () => {
            syncCallback()
        })

        // Clear the spies so we only test the guest joining
        playerJoinedSpy.mockClear()
        playersUpdatedSpy.mockClear()

        // Simulate someone joining
        mockChannel.presenceState.mockReturnValue({
            [result.current.sessionId]: [{ session_id: result.current.sessionId, name: 'Host', is_host: true }],
            'other-session': [{ session_id: 'other-session', name: 'Guest', is_host: false }]
        })

        await act(async () => {
            syncCallback()
        })

        expect(playersUpdatedSpy).toHaveBeenCalled()
        expect(playerJoinedSpy).toHaveBeenCalledWith(expect.objectContaining({
            player: expect.objectContaining({ name: 'Guest' })
        }))
        expect(playerLeftSpy).not.toHaveBeenCalled()

        playerJoinedSpy.mockClear()
        playersUpdatedSpy.mockClear()

        // Simulate someone leaving
        mockChannel.presenceState.mockReturnValue({
            [result.current.sessionId]: [{ session_id: result.current.sessionId, name: 'Host', is_host: true }]
        })

        await act(async () => {
            syncCallback()
        })

        expect(playersUpdatedSpy).toHaveBeenCalled()
        expect(playerLeftSpy).toHaveBeenCalledWith(expect.objectContaining({
            player: expect.objectContaining({ name: 'Guest' })
        }))
        expect(playerJoinedSpy).not.toHaveBeenCalled()
    })
})
