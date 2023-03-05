import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { useState } from "react";

// @ts-ignore - TODO make a ts plugin TODO make a global .t.sol module type
// import PureQuery from "./PureQuery.s.sol";

export default function Home() {
	const [num1, setNum1] = useState(0);
	const [num2, setNum2] = useState(0);
	return (
		<>
			<Head>
				<title>PureQuery Next</title>
				<meta name="description" content="Testing a pure query" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>
			<main className={styles.main}>
				<div>
					<div>Testing a pure query in NEXT.js</div>
					<div>This pure script does not read/write to state</div>
					<div>This is testing that the vm is executing</div>
					<div>Change the inputs and a query will execute</div>
					<div>
						<>
							<input
								type="number"
								value={num1}
								onChange={(e) => setNum1(Number(e.target.value))}
							/>{" "}
							+
							<input
								type="number"
								value={num2}
								onChange={(e) => setNum2(Number(e.target.value))}
							/>{" "}
							=TODO
						</>
					</div>
				</div>
			</main>
		</>
	);
}
