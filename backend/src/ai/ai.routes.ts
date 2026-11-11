import {Router} from "express";
import { getTravelRecommendations, searchFlightsUsingAI } from "./ai.controller.js";
import { getTravelItinerary } from "./ai-itinerary.controller.js";
import { getAIChatResponse } from "./ai-chat.controller.js";
import { compareFlightsUsingAI } from "./ai-compare.controller.js";
import { generateSmartBudgetController } from "./ai-budget.controller.js";

const router= Router();

router.post("/recommendations", getTravelRecommendations);
router.post("/itinerary", getTravelItinerary);
router.post("/chat", getAIChatResponse);
router.post("/flight-search", searchFlightsUsingAI);
router.post("/compare-flights", compareFlightsUsingAI);
router.post("/budget", generateSmartBudgetController);

export default router;