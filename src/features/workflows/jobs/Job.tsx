import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Button, Card } from "flowbite-react";
import { Link } from "react-router-dom";
import { RootState } from "../../../app/store";
import { PlusIcon } from "@heroicons/react/20/solid";
import { JobMin } from "../../../interface";

export default function Job() {
    const auth = useSelector((state: RootState) => state.auth);
    const [jobs, setJobs] = useState<JobMin[]>([]);

    useEffect(() => {
        getJobs()
    }, []);

    const getJobs = () => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/job/all`, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        }).then(res => {
            const jobs: JobMin[] = res.data.data.jobs
            setJobs(jobs);
        })
    }

    return (<section className="h-full px-[5vh]">
        <header className="flex h-[8vh] justify-between items-center">
            <h1>Jobs</h1>
            <Link to='new'><Button pill><PlusIcon className="w-3 h-3" /></Button></Link>
        </header>
        <section className="h-[72vh] overflow-y-scroll">
            {jobs.length > 0 && <section>
                <section className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {jobs.map(job => <Card className="w-[250px] m-auto my-2 sm:w-[300px]">
                        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            <p>
                                {job.name.length > 20 ? job.name.substring(0, 17) + "..." : job.name}
                            </p>
                        </h5>
                        <Link to={`/dashboard/job/${job.id}`}>
                            <Button>
                                <p>
                                    Open Job
                                </p>
                            </Button>
                        </Link>
                    </Card>
                    )}
                </section>
            </section>}
        </section>

    </section >)
}