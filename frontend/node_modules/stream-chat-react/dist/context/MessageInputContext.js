import React, { createContext, useContext } from 'react';
export const MessageInputContext = createContext(undefined);
export const MessageInputContextProvider = ({ children, value, }) => (React.createElement(MessageInputContext.Provider, { value: value }, children));
export const useMessageInputContext = (componentName) => {
    const contextValue = useContext(MessageInputContext);
    if (!contextValue) {
        console.warn(`The useMessageInputContext hook was called outside of the MessageInputContext provider. Make sure this hook is called within the MessageInput's UI component. The errored call is located in the ${componentName} component.`);
        return {};
    }
    return contextValue;
};
