export async function LoadImage(name: string, link: string) {
	const image = await new Promise((resolve, reject) => {
		const out = new Image();
		out.src = link;

		out.onerror = (err) => {
			reject(`Image ${link} failed to load: ${err}`);
		};

		out.onload = () => {
			resolve(out);
		};
	}).catch((err) => console.error(err));

	return {
		name,
		image
	};
}