import { Badge, ListGroup, TextInput } from "flowbite-react";
import Tooltip from "./Tooltip";
import { useRef, useState } from "react";
import { ListGroupItem } from "flowbite-react/lib/esm/components/ListGroup/ListGroupItem";

interface MultiSelectAutoCompleteProps {
    id: string,
    value: string[],
    allItems: string[],
    placeholder?: string,
    onChange: (updatedItems: string[]) => void,
    rules?: {
        selectedItem?: (item: string) => string,
        searchRule?: (item: string) => boolean
    }
    required?: boolean
}

export default function MultiSelectAutoComplete({ id, value: selectedItems, allItems, placeholder, onChange, rules, required = false }: MultiSelectAutoCompleteProps) {
    const [itemInput, setItemInput] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [listIndex, setListIndex] = useState(0);
    const listClearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleRemoveItem = (itemToBeDeleted: string) => {
        onChange(selectedItems.filter(item => item !== itemToBeDeleted));
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setItemInput(e.target.value);
        if (e.target.value) {
            const searchRegex = new RegExp(e.target.value, 'i');
            setSuggestions(allItems.filter(rules?.searchRule ? rules.searchRule : item => searchRegex.test(item)));
            setListIndex(0)
        } else {
            setSuggestions([]);
            setListIndex(0)
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown')
            setListIndex((listIndex + 1) % suggestions.length);
        else if (e.key === 'ArrowUp')
            setListIndex((listIndex + suggestions.length - 1) % suggestions.length);
        else if (e.key === 'Enter' && listIndex >= 0 && suggestions.length > 0) {
            e.preventDefault()
            handleSuggestionClick(suggestions[listIndex])
        }
    };

    const handleSuggestionClick = (item: string) => {
        if (listClearTimeoutRef.current)
            clearTimeout(listClearTimeoutRef.current);
        if (!selectedItems.includes(item)) {
            onChange([...selectedItems, item]);
        }
        setItemInput('');
        setSuggestions([]);
        setListIndex(0);
    };

    return <div id={id}>
        <TextInput
            id="multi-select-auto-complete"
            addon={selectedItems.map((item, index) => (
                <Tooltip key={index} content={item}>
                    <Badge className="hover:cursor-pointer border" onClick={() => handleRemoveItem(item)}>
                        {rules?.selectedItem ? rules.selectedItem(item) : item}
                    </Badge>
                </Tooltip>
            ))}
            theme={{ addon: "max-w-[60%] min-w-[60%] flex-wrap inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400" }}
            placeholder={placeholder} type="text"
            value={itemInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={() => {
                listClearTimeoutRef.current = setTimeout(() => {
                    setItemInput(''); setSuggestions([]); setListIndex(0);
                }, 500);
            }}
            autoComplete="off"
            required={required ? selectedItems.length == 0 : false}
        />
        {suggestions.length > 0 && (
            <ListGroup>
                {suggestions.map((suggestion, index) => (
                    <ListGroupItem key={index} tabIndex={index} active={index == listIndex} onClick={() => handleSuggestionClick(suggestion)}>{suggestion}</ListGroupItem>
                ))}
            </ListGroup>
        )}</div>
}