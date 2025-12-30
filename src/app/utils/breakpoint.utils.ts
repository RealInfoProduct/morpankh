import { Observable } from "rxjs";
import { BreakpointService, BreakpointState } from "../services/breakpoint.service";


export function useBreakpoints(BreakpointService: BreakpointService): Observable<BreakpointState>  {
    return BreakpointService.breakpoint$;
}