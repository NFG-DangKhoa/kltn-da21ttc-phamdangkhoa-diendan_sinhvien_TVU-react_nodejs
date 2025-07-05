import { useState, useEffect, useCallback } from 'react';
import forumRulesService from '../services/forumRulesService';

export const useForumRules = (user = null) => {
    const [rules, setRules] = useState(null);
    const [needsAgreement, setNeedsAgreement] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showRulesDialog, setShowRulesDialog] = useState(false);

    // Check if user needs to agree to rules
    const checkAgreement = useCallback(async () => {
        if (!user) {
            setNeedsAgreement(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const response = await forumRulesService.checkRulesAgreement();
            
            if (response.success) {
                const { needsAgreement: needs, rules: rulesData } = response.data;
                setNeedsAgreement(needs);
                if (needs && rulesData) {
                    setRules(rulesData);
                }
            }
        } catch (error) {
            console.error('Error checking rules agreement:', error);
            setError('Không thể kiểm tra quy định diễn đàn');
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Load current rules
    const loadRules = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await forumRulesService.getCurrentRules();
            
            if (response.success) {
                setRules(response.data);
            }
        } catch (error) {
            console.error('Error loading rules:', error);
            setError('Không thể tải quy định diễn đàn');
        } finally {
            setLoading(false);
        }
    }, []);

    // User agrees to rules
    const agreeToRules = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            await forumRulesService.agreeToRules();
            setNeedsAgreement(false);
            setShowRulesDialog(false);
            
            return true;
        } catch (error) {
            console.error('Error agreeing to rules:', error);
            setError('Không thể đồng ý quy định');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // Show rules dialog
    const showRules = useCallback(() => {
        setShowRulesDialog(true);
    }, []);

    // Hide rules dialog
    const hideRules = useCallback(() => {
        setShowRulesDialog(false);
    }, []);

    // Check agreement when user changes
    useEffect(() => {
        if (user) {
            checkAgreement();
        }
    }, [user, checkAgreement]);

    return {
        rules,
        needsAgreement,
        loading,
        error,
        showRulesDialog,
        checkAgreement,
        loadRules,
        agreeToRules,
        showRules,
        hideRules,
        setShowRulesDialog
    };
};

export default useForumRules;
