import { jwtDecode } from "jwt-decode"


export const decodedToken = ()=>{
    return sessionStorage.getItem("token") ? jwtDecode(sessionStorage.getItem("token")) : null
}