import  {Router } from  "express"  ;
import { verifyTicketController}  from "./ticket-verification.controller.js"

const router= Router ();

router.get (

  "/:bookingReference/verify",
 
      verifyTicketController
) ;

export default router;