import { useForm } from "@mantine/form";
import { AppShell, Box, Button, Divider, Group, NumberInput, Text, TextInput } from "@mantine/core";
import { Fragment } from "react";

function App() {
  const form = useForm({
    initialValues: {
      priceUnit: "Ft",
      distanceUnit: "km",
      distanceCount: 100,
      fluidUnit: "l",
      prices: [{ name: "", price: 0, consumption: 0 }],
    },
    validate: {
      prices: (value) => {
        if (value.length === 0)
          return "At least one price is required";

        if (value.some((item) => item.price === 0))
          return "Price can't be 0";

        if (value.some((item) => item.name === ""))
          return "Name can't be empty";

        const names = value.map((item) => item.name);
        const uniqueNames = new Set(names);
        if (names.length !== uniqueNames.size)
          return "Name must be unique";

        return true;
      }
    }
  });

  function calculatePricePerDistanceUnit(item?: { price: number, consumption: number }) {
    return item ? ((item.price * item.consumption) / form.values.distanceCount) : NaN;
  }

  return (
    <AppShell>
      <Box mx="auto" maw={510}>
        <TextInput mx="md" {...form.getInputProps("priceUnit")} label="Price unit" />
        <TextInput mx="md" {...form.getInputProps("distanceUnit")} label="Distance unit" />
        <NumberInput mx="md" {...form.getInputProps("distanceCount")} label="Distance count" min={0} />
        <TextInput mx="md" {...form.getInputProps("fluidUnit")} label="Fluid unit" />
        <Divider my="xs" size="md" />

        {form.values.prices.map((item, index) => {
          const priceDiff = Math.abs(form.values.prices[index - 1]?.price - item.price);

          const pricePerDistanceUnit = calculatePricePerDistanceUnit(item);
          const pricePerDistanceUnitPrev = calculatePricePerDistanceUnit(form.values.prices[index - 1]);

          const isTheCheapest = form.values.prices.every((price) => calculatePricePerDistanceUnit(price) >= pricePerDistanceUnit);

          return <Fragment key={index}>
            {index > 0 && <Divider
              my="xs"
              label={`Difference: ${isNaN(priceDiff) ? "?" : priceDiff} ${form.values.priceUnit}/${form.values.distanceUnit} (${isNaN(pricePerDistanceUnitPrev) ? "?" : Math.abs(pricePerDistanceUnit - pricePerDistanceUnitPrev).toFixed(2)} ${form.values.priceUnit}/${form.values.fluidUnit})`}
              labelPosition="center" />}
            <Group mt="xs" noWrap>
              <TextInput
                sx={{ flexGrow: 1, "& input": { border: isTheCheapest ? "1px solid green" : undefined } }}
                {...form.getInputProps(`prices.${index}.name`)} label="Name" />
              <NumberInput
                sx={{ flexGrow: 1, "& input": { border: isTheCheapest ? "1px solid green" : undefined } }}
                {...form.getInputProps(`prices.${index}.consumption`)}
                label={`${form.values.fluidUnit}/${form.values.distanceCount}${form.values.distanceUnit}`}
                min={0}
                precision={2}
                step={0.1} />
              <NumberInput
                sx={{ flexGrow: 1, "& input": { border: isTheCheapest ? "1px solid green" : undefined } }}
                {...form.getInputProps(`prices.${index}.price`)}
                label={`${form.values.priceUnit}/${form.values.fluidUnit}`}
                min={0}
                precision={2} />
              <Text sx={{ whiteSpace: "nowrap" }} color={isTheCheapest ? "green" : undefined}>
                {(isNaN(pricePerDistanceUnit) ? 0 : pricePerDistanceUnit).toFixed(2)} {form.values.priceUnit}/{form.values.distanceUnit}
              </Text>
              <Button color="red" compact onClick={() => form.removeListItem("prices", index)}>X</Button>
            </Group>
          </Fragment>;
        })}

        <Group position="center" mt="md">
          <Button onClick={() => form.insertListItem("prices", { price: 0, name: "" })}>
            Add price
          </Button>
        </Group>
      </Box>
    </AppShell>
  );
}

export default App;
