"use client";

import { useEffect, useState } from "react";

type Selector<TState, TResult> = (state: TState) => TResult;

function useStore<TState, TResult>(
	store: (selector: Selector<TState, TResult>) => TResult,
	selector: Selector<TState, TResult>,
) {
	const result = store(selector);
	const [data, setData] = useState<TResult>();

	useEffect(() => {
		setData(result);
	}, [result]);

	return data;
}

export default useStore;