import { useEffect } from 'react';

const UseConfirmBeforeLeave = (dataSaved) => {
    useEffect(() => {
        const confirmClose = (event) => {
            if (!dataSaved) {
                // Prompt user only if data hasn't been saved
                const confirmationMessage = 'Are you sure you want to leave? Changes you made may not be saved.';
                event.returnValue = confirmationMessage;
                return confirmationMessage;
            }
        };

        const confirmBack = (event) => {
            if (!dataSaved) {
                event.preventDefault();
                const confirmationMessage = 'Are you sure you want to go back? Changes you made may not be saved.';
                alert(confirmationMessage); // You can use a custom dialog here instead of alert
            }
        };

        window.addEventListener('beforeunload', confirmClose);
        window.addEventListener('popstate', confirmBack);

        return () => {
            window.removeEventListener('beforeunload', confirmClose);
            window.removeEventListener('popstate', confirmBack);
        };
    }, [dataSaved]);
};

export default UseConfirmBeforeLeave;
