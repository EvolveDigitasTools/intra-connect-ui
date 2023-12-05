import axios from "axios"
import { Badge, Button, Label, ListGroup, Select, TextInput, Tooltip } from "flowbite-react"
import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { RootState } from "../../../app/store"
import { ListGroupItem } from "flowbite-react/lib/esm/components/ListGroup/ListGroupItem"

type AddJobConfigProps = {
    assigneesDesignation: string,
    completeJobConfig: (assignees: string[], approvers: string[], timeNeeded: number, timeUnit: string) => void
}

export default function AddJobConfig({ assigneesDesignation, completeJobConfig }: AddJobConfigProps) {
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
    const [selectedApprovers, setSelectedApprovers] = useState<string[]>([]);
    const [assigneeInput, setAssigneeInput] = useState('');
    const [approverInput, setApproverInput] = useState('');
    const [assigneesSuggestions, setAssigneesSuggestions] = useState<string[]>([]);
    const [approversSuggestions, setApproversSuggestions] = useState<string[]>([]);
    const [allMembers, setAllMembers] = useState<string[]>([]);
    const [assigneeListIndex, setAssigneeListIndex] = useState(-1);
    const [approverListIndex, setApproverListIndex] = useState(-1);
    const [timeAmount, setTimeAmount] = useState(0);
    const [timeUnit, setTimeUnit] = useState('hours');
    const listClearTimeoutRefAssignee = useRef<NodeJS.Timeout | null>(null);
    const listClearTimeoutRefApprover = useRef<NodeJS.Timeout | null>(null);
    const auth = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/assignees`, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        }).then(res => {
            setAllMembers(res.data.data.assignees);
        })
    }, [])

    const handleRemoveAssignee = (person: string) => {
        setSelectedAssignees(selectedAssignees.filter(assignee => assignee !== person));
    };

    const handleRemoveApprover = (person: string) => {
        setSelectedApprovers(selectedApprovers.filter(approver => approver !== person));
    };

    const handleInputChangeAssignee = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAssigneeInput(e.target.value);
        if (e.target.value) {
            const searchRegex = new RegExp(e.target.value, 'i');
            setAssigneesSuggestions(allMembers.filter(person => searchRegex.test(person.split('@')[0])));
            setAssigneeListIndex(-1)
        } else {
            setAssigneesSuggestions([]);
            setAssigneeListIndex(-1)
        }
    };

    const handleInputChangeApprover = (e: React.ChangeEvent<HTMLInputElement>) => {
        setApproverInput(e.target.value);
        if (e.target.value) {
            const searchRegex = new RegExp(e.target.value, 'i');
            setApproversSuggestions(allMembers.filter(person => searchRegex.test(person.split('@')[0])));
            setApproverListIndex(-1)
        } else {
            setApproversSuggestions([]);
            setApproverListIndex(-1)
        }
    };

    const handleKeyDownAssignee = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown')
            setAssigneeListIndex((assigneeListIndex + 1) % assigneesSuggestions.length);
        else if (e.key === 'ArrowUp')
            setAssigneeListIndex((assigneeListIndex + assigneesSuggestions.length - 1) % assigneesSuggestions.length);
        else if (e.key === 'Enter' && assigneeListIndex >= 0) {
            e.preventDefault()
            handleSuggestionClickAssignee(assigneesSuggestions[assigneeListIndex])
        }
    };

    const handleKeyDownApprover = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown')
            setApproverListIndex((approverListIndex + 1) % approversSuggestions.length);
        else if (e.key === 'ArrowUp')
            setApproverListIndex((approverListIndex + approversSuggestions.length - 1) % approversSuggestions.length);
        else if (e.key === 'Enter' && approverListIndex >= 0) {
            e.preventDefault()
            handleSuggestionClickApprover(approversSuggestions[approverListIndex])
        }
    };

    const handleSuggestionClickAssignee = (person: string) => {
        if (listClearTimeoutRefAssignee.current)
            clearTimeout(listClearTimeoutRefAssignee.current);
        if (!selectedAssignees.includes(person)) {
            setSelectedAssignees([...selectedAssignees, person]);
        }
        setAssigneeInput('');
        setAssigneesSuggestions([]);
        setAssigneeListIndex(-1);
    };

    const handleSuggestionClickApprover = (person: string) => {
        if (listClearTimeoutRefApprover.current)
            clearTimeout(listClearTimeoutRefApprover.current);
        if (!selectedApprovers.includes(person)) {
            setSelectedApprovers([...selectedApprovers, person]);
        }
        setApproverInput('');
        setApproversSuggestions([]);
        setApproverListIndex(-1);
    };

    const completeJobConfigEvent = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        completeJobConfig(selectedAssignees, selectedApprovers, timeAmount, timeUnit)
    }

    return <form className="flex w-60 flex-col gap-1" onSubmit={completeJobConfigEvent}>
        <div>
            <div className="mb-1 block">
                <Label htmlFor="assignees" value={`Assignee - ${assigneesDesignation}`} />
            </div>
            <TextInput
                id="assigness"
                addon={selectedAssignees.map((assignee, index) => (
                    <Tooltip key={index} content={assignee}>
                        <Badge className="hover:cursor-pointer border" onClick={() => handleRemoveAssignee(assignee)}>
                            {assignee.split('@')[0].replace(' ', '')}
                        </Badge>
                    </Tooltip>
                ))}
                theme={{ addon: "max-w-[60%] min-w-[60%] flex-wrap inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400" }}
                placeholder="Search Assignee"
                value={assigneeInput}
                onChange={handleInputChangeAssignee}
                onKeyDown={handleKeyDownAssignee}
                onBlur={() => {
                    listClearTimeoutRefAssignee.current = setTimeout(() => {
                        setAssigneeInput(''); setAssigneesSuggestions([]); setAssigneeListIndex(-1);
                    }, 500);
                }}
                autoComplete="off"
                required={selectedAssignees.length == 0}
                sizing='sm'
            />
            {assigneesSuggestions.length > 0 && (
                <ListGroup>
                    {assigneesSuggestions.map((suggestion, index) => (
                        <ListGroupItem key={index} tabIndex={index} active={index == assigneeListIndex} onClick={() => handleSuggestionClickAssignee(suggestion)}>{suggestion}</ListGroupItem>
                    ))}
                </ListGroup>
            )}
        </div>
        <div>
            <div className="mb-1 block">
                <Label htmlFor="approver" value='Approver' />
            </div>
            <TextInput
                id="approver"
                addon={selectedApprovers.map((approver, index) => (
                    <Tooltip key={index} content={approver}>
                        <Badge className="hover:cursor-pointer border" onClick={() => handleRemoveApprover(approver)}>
                            {approver.split('@')[0].replace(' ', '')}
                        </Badge>
                    </Tooltip>
                ))}
                theme={{ addon: "max-w-[60%] min-w-[60%] flex-wrap inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400" }}
                placeholder="Search Approver"
                value={approverInput}
                onChange={handleInputChangeApprover}
                onKeyDown={handleKeyDownApprover}
                onBlur={() => {
                    listClearTimeoutRefApprover.current = setTimeout(() => {
                        setApproverInput(''); setApproversSuggestions([]); setApproverListIndex(-1);
                    }, 500);
                }}
                autoComplete="off"
                required={selectedAssignees.length == 0}
                sizing='sm'
            />
            {approversSuggestions.length > 0 && (
                <ListGroup>
                    {approversSuggestions.map((suggestion, index) => (
                        <ListGroupItem key={index} tabIndex={index} active={index == approverListIndex} onClick={() => handleSuggestionClickApprover(suggestion)}>{suggestion}</ListGroupItem>
                    ))}
                </ListGroup>
            )}
        </div>
        <div className="flex items-center gap-2">
            <div>
                <Label htmlFor="timeAmount">Time Needed</Label>
                <TextInput
                    id="timeAmount"
                    type="number"
                    placeholder="Enter time"
                    value={timeAmount}
                    onChange={(e) => setTimeAmount(Number(e.target.value))}
                    className="mt-1"
                    required
                />
            </div>
            <div>
                <Label htmlFor="timeUnit">Unit</Label>
                <Select id="timeUnit" value={timeUnit} onChange={(e) => setTimeUnit(e.target.value)} className="mt-1">
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                </Select>
            </div>
        </div>
        <Button type="submit">Submit</Button>
    </form >
}