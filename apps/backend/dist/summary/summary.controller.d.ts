import { SummaryService } from './summary.service';
import type { AuthenticatedUser } from '../auth/current-user.decorator';
export declare class SummaryController {
    private readonly summary;
    constructor(summary: SummaryService);
    getToday(user: AuthenticatedUser): Promise<import("./summary.service").DailySummary>;
}
