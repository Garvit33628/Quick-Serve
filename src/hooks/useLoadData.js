import { useEffect, useState } from "react";
import { getUserData } from "../https";
import { removeUser, setUser } from "../redux/slices/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const useLoadData = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await getUserData();
                if (data && data.data) {
                    const { _id, name, email, phone, isAdmin, role } = data.data;
                    const userRole = role || (isAdmin ? "Admin" : "Staff");
                    dispatch(setUser({ _id, name, email, phone, role: userRole, isAdmin }));
                }
            } catch (error) {
                dispatch(removeUser());
                navigate("/auth");
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, [dispatch, navigate]);

    return isLoading;
};

export default useLoadData;