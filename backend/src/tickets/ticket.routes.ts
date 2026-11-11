import { Router}   from "express";
import {downloadETicketController } from "./ticket.controller.js";

const router =Router ();

router.get (

  "/:bookingReference/download" ,

  downloadETicketController
);

export default router;