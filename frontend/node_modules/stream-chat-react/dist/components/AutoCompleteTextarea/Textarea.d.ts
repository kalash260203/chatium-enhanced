export class ReactTextareaAutocomplete extends React.Component<any, any, any> {
    static defaultProps: {
        closeOnClickOutside: boolean;
        maxRows: number;
        minChar: number;
        movePopupAsYouType: boolean;
        scrollToItem: boolean;
        value: string;
    };
    /**
     * setup to emulate the UNSAFE_componentWillReceiveProps
     */
    static getDerivedStateFromProps(props: any, state: any): {
        propsValue: any;
        value: any;
    } | null;
    constructor(props: any);
    state: {
        actualToken: string;
        component: null;
        currentTrigger: null;
        data: null;
        dataLoading: boolean;
        isComposing: boolean;
        left: null;
        selectionEnd: number;
        selectionStart: number;
        top: null;
        value: any;
    };
    getSelectionPosition: () => {
        selectionEnd: number;
        selectionStart: number;
    } | null;
    getSelectedText: () => any;
    setCaretPosition: (position?: number) => void;
    getCaretPosition: () => number;
    /**
     * isComposing prevents double submissions in Korean and other languages.
     * starting point for a read:
     * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/isComposing
     * In the long term, the fix should happen by handling keypress, but changing this has unknown implications.
     * @param event React.KeyboardEvent
     */
    _defaultShouldSubmit: (event: any) => boolean;
    _handleKeyDown: (event: any) => void | Promise<void>;
    _onEnter: (event: any) => Promise<void>;
    _onSpace: () => void;
    _replaceWord: () => Promise<void>;
    _onSelect: (newToken: any) => void;
    _getItemOnSelect: (paramTrigger: any) => ((item: any) => any) | null;
    _getTextToReplace: (paramTrigger: any) => ((item: any) => any) | null;
    _getCurrentTriggerSettings: (paramTrigger: any) => any;
    _getValuesFromProvider: () => void;
    _getSuggestions: (paramTrigger: any) => null;
    /**
     * Close autocomplete, also clean up trigger (to avoid slow promises)
     */
    _closeAutocomplete: () => void;
    _cleanUpProps: () => {
        [x: string]: any;
    };
    _isCommand: (text: any) => boolean;
    _changeHandler: (e: any) => void;
    _selectHandler: (e: any) => void;
    _onClickAndBlurHandler: (e: any) => void;
    _onScrollHandler: () => void;
    _dropdownScroll: (item: any) => void;
    getTriggerProps: () => {
        component: null;
        currentTrigger: null;
        getSelectedItem: ((item: any) => any) | null;
        getTextToReplace: ((item: any) => any) | null;
        selectionEnd: number;
        value: any;
        values: null;
    };
    setDropdownRef: (element: any) => void;
    dropdownRef: any;
    renderSuggestionListContainer(): React.JSX.Element | null;
    render(): React.JSX.Element;
    textareaRef: HTMLTextAreaElement | null | undefined;
}
export namespace ReactTextareaAutocomplete {
    namespace propTypes {
        export let className: PropTypes.Requireable<string>;
        export let closeOnClickOutside: PropTypes.Requireable<boolean>;
        export let containerClassName: PropTypes.Requireable<string>;
        export let containerStyle: PropTypes.Requireable<object>;
        export let disableMentions: PropTypes.Requireable<boolean>;
        export let dropdownClassName: PropTypes.Requireable<string>;
        export let dropdownStyle: PropTypes.Requireable<object>;
        export let itemClassName: PropTypes.Requireable<string>;
        export let itemStyle: PropTypes.Requireable<object>;
        export let listClassName: PropTypes.Requireable<string>;
        export let listStyle: PropTypes.Requireable<object>;
        export let loaderClassName: PropTypes.Requireable<string>;
        export let loaderStyle: PropTypes.Requireable<object>;
        export let loadingComponent: PropTypes.Requireable<PropTypes.ReactComponentLike>;
        export let minChar: PropTypes.Requireable<number>;
        export let onBlur: PropTypes.Requireable<(...args: any[]) => any>;
        export let onCaretPositionChange: PropTypes.Requireable<(...args: any[]) => any>;
        export let onChange: PropTypes.Requireable<(...args: any[]) => any>;
        export let onSelect: PropTypes.Requireable<(...args: any[]) => any>;
        export let shouldSubmit: PropTypes.Requireable<(...args: any[]) => any>;
        export let style: PropTypes.Requireable<object>;
        export let SuggestionList: PropTypes.Requireable<PropTypes.ReactComponentLike>;
        export { triggerPropsCheck as trigger };
        export let value: PropTypes.Requireable<string>;
    }
}
import React from 'react';
import PropTypes from 'prop-types';
import { triggerPropsCheck } from './utils';
