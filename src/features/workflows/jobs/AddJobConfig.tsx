import axios from "axios"
import { Button, Label, Select, TextInput } from "flowbite-react"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { RootState } from "../../../app/store"
import MultiSelectAutoComplete from "../../../components/MultiSelectAutoComplete"
import { FieldValues } from "../../../interface"

type AddJobConfigProps = {
    assigneesDesignation: string,
    configDetails: any,
    tempAssignees: FieldValues,
    completeJobConfig: (assigneesDesignationValues: FieldValues, approvers: string[], timeNeeded: number, timeUnit: string) => void
}

export default function AddJobConfig({ assigneesDesignation, configDetails, tempAssignees, completeJobConfig }: AddJobConfigProps) {
    const [assigneeDesginationValues, setAssigneeDesginationValues] = useState<FieldValues>(
        JSON.parse(assigneesDesignation).reduce((acc: FieldValues, field: string) => ({ ...acc, [field]: tempAssignees[field] ?? [] }), {})
    );
    const [selectedApprovers, setSelectedApprovers] = useState<string[]>([]);
    const [allMembers, setAllMembers] = useState<string[]>([]);
    const [timeAmount, setTimeAmount] = useState(0);
    const [timeUnit, setTimeUnit] = useState('hours');
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

    useEffect(() => {
        if (configDetails.assigneesDesignationValues)
            setAssigneeDesginationValues(configDetails.assigneesDesignationValues)
        if (configDetails.approvers)
            setSelectedApprovers(configDetails.approvers)
        if (configDetails.timeNeeded)
            setTimeAmount(configDetails.timeNeeded)
        if (configDetails.timeUnit)
            setTimeUnit(configDetails.timeUnit)
    }, [configDetails.approvers, configDetails.timeNeeded, configDetails.timeUnit, configDetails.assigneesDesignationValues])

    const completeJobConfigEvent = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        completeJobConfig(assigneeDesginationValues, selectedApprovers, timeAmount, timeUnit)
    }

    const handleAssigneeDesignationValueChange = (assigneeDesignation: string, value: string[]) => {
        setAssigneeDesginationValues({ ...assigneeDesginationValues, [assigneeDesignation]: value });
    };

    return <form className="flex w-60 flex-col gap-1" onSubmit={completeJobConfigEvent}>
        <div>
            {JSON.parse(assigneesDesignation).map((assigneeDesignation: string, index: number) => <div key={index}>
                <div className="mb-1 block">
                    <Label htmlFor={`assignee-${assigneeDesignation}`} value={`Assignee - ${assigneeDesignation}`} />
                </div>
                <MultiSelectAutoComplete
                    id={index + ''}
                    value={assigneeDesginationValues[assigneeDesignation]}
                    allItems={allMembers}
                    onChange={(selectedMember) => handleAssigneeDesignationValueChange(assigneeDesignation, selectedMember)}
                    theme={{
                        textField: {
                            sizing: 'sm'
                        }
                    }}
                    rules={{
                        selectedItem: (item) => item.split('@')[0]
                    }}
                    required
                />
            </div>)}
        </div>
        <div>
            <div className="mb-1 block">
                <Label htmlFor="approver" value='Approver' />
            </div>
            <MultiSelectAutoComplete
                id="approver"
                value={selectedApprovers}
                allItems={allMembers}
                onChange={(selectedMembers) => setSelectedApprovers(selectedMembers)}
                theme={{
                    textField: {
                        sizing: 'sm'
                    }
                }}
                rules={{
                    selectedItem: (item) => item.split('@')[0]
                }}
                required
            />
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