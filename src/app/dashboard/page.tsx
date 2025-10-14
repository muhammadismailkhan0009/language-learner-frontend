import { Header } from "@/components/common/app-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateFlashCards } from "./_actions/generateFlashCards";


export default function DashBoardPage() {

    return (
        <div className="">
            <Header></Header>
            <div className="">
                <form className="" action={generateFlashCards}>
                    <Label htmlFor="message">Scanerio</Label>
                    <Textarea placeholder="Describe your scenario here." id="message" />
                    <Button type="submit">Generate</Button>
                </form>
            </div>
        </div>

    )
}
