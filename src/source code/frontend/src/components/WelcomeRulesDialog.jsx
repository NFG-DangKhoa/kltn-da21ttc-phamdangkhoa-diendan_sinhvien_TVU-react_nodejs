import React, { useContext } from 'react';
import ForumRulesDialog from './ForumRulesDialog';
import { AuthContext } from '../context/AuthContext';

const WelcomeRulesDialog = () => {
    const { showWelcomeRules, hideWelcomeRules, agreeToWelcomeRules } = useContext(AuthContext);

    return (
        <ForumRulesDialog
            open={showWelcomeRules}
            onClose={hideWelcomeRules}
            onAgree={agreeToWelcomeRules}
            showCloseButton={false} // Không cho phép đóng mà không đồng ý
            title="Chào mừng bạn đến với diễn đàn! - Vui lòng đọc quy định"
        />
    );
};

export default WelcomeRulesDialog;
