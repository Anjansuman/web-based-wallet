
import { Router } from "express";

const router: Router = Router();

router.post("/best-swap-value", (req, res) => {
    try {
        
    } catch (error) {
        res.status(500).json({
            message: "Internal server error!"
        });
    }
});

export default router;