import axios from "axios";
import { useEffect, useState } from "react"
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { WorkflowDetail } from "../../../interface";
import { Button, Card } from "flowbite-react";
import { Link } from "react-router-dom";

export default function NewJob() {
    const [workflows, setWorkflows] = useState<WorkflowDetail[]>([]);
    const auth = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        getPublishedWorkflows()
    }, []);

    const getPublishedWorkflows = () => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/workflow/published`, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        }).then(res => {
            const workflows: WorkflowDetail[] = res.data.data.workflows
            setWorkflows(workflows);
        })
    }

    return ((<section className="h-full px-[5vh]">
        <header className="flex h-[8vh] justify-between items-center">
            <h1>Choose the workflow you want to use for your new Job</h1>
        </header>
        <section className="h-[72vh] overflow-y-scroll">
            {workflows.length > 0 && <section>
                <section className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {workflows.map(workflow => <Card key={workflow.id} className="w-[250px] m-auto my-2 sm:w-[300px]">
                        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            <p>
                                {workflow.name.length > 20 ? workflow.name.substring(0, 17) + "..." : workflow.name}
                            </p>
                        </h5>
                        <p className="font-normal text-gray-700 dark:text-gray-400">
                            {workflow.description.length > 50 ? workflow.description.substring(0, 47) + "..." : workflow.description}
                        </p>
                        <Link to={`${workflow.id}`}>
                            <Button>
                                <p>
                                    Use this Workflow
                                </p>
                            </Button>
                        </Link>
                    </Card>
                    )}
                </section>
            </section>}
        </section>

    </section >))
}