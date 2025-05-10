import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk"
import { useEffect, useState } from "react"
import { start } from "repl";

export const userGetCalls=()=>{
    const [calls, setCalls] = useState<Call[]>([]);
    const [isLoading, setisLoading] = useState(false);
    const client =useStreamVideoClient();
    const user = 'Ali'; 

    useEffect(()=>{
        const loadCalls=async()=>{
            if(!client || user)return;

            setisLoading(true);

            try {
                const {calls}=await client.queryCalls({
                    sort:[{field:'starts_at',direction:-1}],
                    filter_conditions:{
                        starts_at:{$exists:true},
                        $or:[
                            {created_by_user:user},
                            {members :{$in:[user]}},

                        ]
                    }
                });
                setCalls(calls);
            } catch (error) {
                console.log(error)
            } finally{
                setisLoading(false)
            }
        }
        loadCalls();
    },[client,user])
const now =new Date();


    const endedCalls=calls.filter(({ state:{startsAt,endedAt}}:Call)=>{
        return(startsAt && new Date(startsAt) < now || !!endedAt)
    });
    const upcomingCalls=calls.filter(({ state:{startsAt,endedAt}}:Call)=>{
        return startsAt && new Date(startsAt)<now
    });
  

    return{
        endedCalls,
        upcomingCalls,
        callRecordings:calls,
        isLoading,
    }
}