// src/hooks/useDrafts.js
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid

const LOCAL_STORAGE_KEY = 'my_app_drafts';

export const useDrafts = () => {
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Tải bản nháp từ Local Storage khi khởi tạo
    useEffect(() => {
        try {
            const storedDrafts = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedDrafts) {
                setDrafts(JSON.parse(storedDrafts));
            }
        } catch (e) {
            console.error("Failed to load drafts from local storage", e);
            setError("Không thể tải bản nháp.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Lưu bản nháp vào Local Storage mỗi khi chúng thay đổi
    useEffect(() => {
        if (!loading) { // Chỉ lưu sau khi đã tải xong lần đầu
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(drafts));
            } catch (e) {
                console.error("Failed to save drafts to local storage", e);
                setError("Không thể lưu bản nháp.");
            }
        }
    }, [drafts, loading]);

    const addDraft = useCallback((newDraft) => {
        const draftWithId = {
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            lastSaved: new Date().toISOString(),
            ...newDraft,
        };
        setDrafts((prevDrafts) => [draftWithId, ...prevDrafts]);
    }, []);

    const updateDraft = useCallback((updatedDraft) => {
        setDrafts((prevDrafts) =>
            prevDrafts.map((draft) =>
                draft.id === updatedDraft.id
                    ? { ...draft, ...updatedDraft, lastSaved: new Date().toISOString() }
                    : draft
            )
        );
    }, []);

    const deleteDraft = useCallback((id) => {
        setDrafts((prevDrafts) => prevDrafts.filter((draft) => draft.id !== id));
    }, []);

    return { drafts, addDraft, updateDraft, deleteDraft, loading, error };
};