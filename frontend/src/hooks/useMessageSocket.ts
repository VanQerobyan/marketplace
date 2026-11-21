import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io, type Socket } from "socket.io-client";
import { selectAuth } from "../../store/authSlice";
import { messagesApi } from "../../store/api/messagesApi";
import { notificationsApi } from "../../store/api/notificationsApi";
import type { MessageSocketResponse, SendMessageData } from "../types/messageType";

export const useMessageSocket = () => {
    const { token, sessionVersion } = useSelector(selectAuth);
    const dispatch = useDispatch();
    const socketRef = useRef<Socket | null>(null);
    const [connectedToken, setConnectedToken] = useState<string | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) return;
        const socket = io("http://localhost:5000", { auth: { token }, autoConnect: false });
        socketRef.current = socket;
        const refreshMessages = () => dispatch(messagesApi.util.invalidateTags(["messages"]));

        socket.on("connect", () => {
            setConnectedToken(token);
            setError("");
            refreshMessages(); // Recover messages missed while this connection was offline.
        });
        socket.on("disconnect", () => {
            setConnectedToken(null);
            refreshMessages(); // HTTP can refresh an expired access token and reconnect the socket.
        });
        socket.on("connect_error", () => {
            setConnectedToken(null);
            setError("Unable to connect to messages. Check your connection and try again.");
            refreshMessages();
        });
        socket.on("message:new", () => {
            refreshMessages();
            dispatch(notificationsApi.util.invalidateTags(["notification"]));
        });
        socket.on("message:read", () => {
            refreshMessages();
            dispatch(notificationsApi.util.invalidateTags(["notification"]));
        });
        socket.on("message:error", (response: { message?: string }) => {
            setError(response.message || "The message connection failed.");
            refreshMessages();
        });
        socket.connect();
        return () => {
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
        };
    }, [token, sessionVersion, dispatch]);

    const sendMessage = useCallback(async (payload: SendMessageData) => {
        const socket = socketRef.current;
        if (!socket?.connected) throw new Error("The connection is offline. Please reconnect before sending.");
        let response: MessageSocketResponse;
        try {
            response = await socket.timeout(5000).emitWithAck("message:send", payload);
        } catch {
            dispatch(messagesApi.util.invalidateTags(["messages"]));
            throw new Error("We couldn't confirm delivery. Check the conversation before sending again.");
        }
        if (!response.success || !response.data) throw new Error(response.message || "Your message could not be sent.");
        dispatch(messagesApi.util.invalidateTags(["messages"]));
        return response.data;
    }, [dispatch]);

    const reconnect = () => socketRef.current?.connect();
    return { sendMessage, isConnected: Boolean(token && connectedToken === token), error, reconnect };
};
