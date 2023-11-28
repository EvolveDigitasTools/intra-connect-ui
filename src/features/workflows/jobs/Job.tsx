import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Button, Card } from "flowbite-react";
import { Link } from "react-router-dom";
import { RootState } from "../../../app/store";

export default function Job() {
    const auth = useSelector((state: RootState) => state.auth);
    // const [workflows, setWorkflows] = useState<WorkflowDetail[]>([]);

    useEffect(() => {
        // getWorkflows()
    }, []);

    const getWorkflows = () => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/workflow/all`, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        }).then(res => {
            // const workflows: WorkflowDetail[] = res.data.data.workflows
            // setWorkflows(workflows);
        })
    }

    return (<section className="h-full px-[5vh]">
        <header className="flex h-[8vh] justify-between items-center">
            <h1>Jobs</h1>
            {/* <NewWorkflow /> */}
        </header>
        <section className="h-[72vh] overflow-y-scroll">
            {/* {workflows.length > 0 && <section>
                <section className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {workflows.map(workflow => <Card className="w-[250px] m-auto my-2 sm:w-[300px]">
                        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            <p>
                                {workflow.name.length > 20 ? workflow.name.substring(0, 17) + "..." : workflow.name}
                            </p>
                        </h5>
                        <p className="font-normal text-gray-700 dark:text-gray-400">
                            <p>
                                {workflow.description.length > 50 ? workflow.description.substring(0, 47) + "..." : workflow.description}
                            </p>
                        </p>
                        <Link to={`/dashboard/workflow/${workflow.id}`}>
                            <Button>
                                <p>
                                    Open Workflow
                                </p>
                            </Button>
                        </Link>
                    </Card>
                    )}
                </section>
            </section>} */}
        </section>
        
    </section >)
}