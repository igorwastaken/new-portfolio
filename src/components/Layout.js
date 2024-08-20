import { motion } from "framer-motion";
import Navbar from "./Navbar";
import { poppins } from "@/pages";

const Layout = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{
      type: "spring",
      stiffness: 260,
      damping: 20,
    }}
    className={poppins.className}
  >
    <Navbar/>
    {children}
  </motion.div>
);
export default Layout;